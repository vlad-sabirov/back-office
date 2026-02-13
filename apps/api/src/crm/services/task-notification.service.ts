import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common';
import { TelegramService } from '../../notification/services/telegram.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

@Injectable()
export class TaskNotificationService extends PrismaService {
	private readonly logger = new Logger(TaskNotificationService.name);

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	/**
	 * Форматирование даты для сообщений
	 */
	private formatDate(date: Date): string {
		return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
	}

	/**
	 * Форматирование приоритета для сообщений
	 */
	private formatPriority(priority: string): string {
		const priorities: Record<string, string> = {
			low: 'Низкий',
			normal: 'Обычный',
			high: '⚡ Высокий',
			urgent: '🔥 Срочный',
		};
		return priorities[priority] || priority;
	}

	/**
	 * Отправка сообщения пользователю
	 */
	private async sendToUser(userId: number, message: string): Promise<void> {
		try {
			const user = await this.user.findUnique({
				where: { id: userId },
				select: { telegramId: true, firstName: true, lastName: true },
			});

			if (user?.telegramId) {
				await this.telegramService.sendMessage(Number(user.telegramId), message);
				this.logger.log(`Sent notification to user ${userId} (${user.lastName} ${user.firstName})`);
			}
		} catch (error) {
			this.logger.error(`Failed to send notification to user ${userId}:`, error);
		}
	}

	/**
	 * Получить руководителя пользователя
	 */
	private async getBossId(userId: number): Promise<number | null> {
		const user = await this.user.findFirst({
			where: {
				child: { some: { id: userId } },
			},
			select: { id: true },
		});
		return user?.id || null;
	}

	/**
	 * Уведомление о создании задачи
	 */
	async notifyTaskCreated(task: any): Promise<void> {
		const message = `📋 <b>Новая задача</b>
"${task.title}"
${task.priority !== 'normal' ? `⚡ Приоритет: ${this.formatPriority(task.priority)}\n` : ''}${task.deadline ? `📅 Дедлайн: ${this.formatDate(new Date(task.deadline))}\n` : ''}${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}\n` : ''}👤 Автор: ${task.author?.lastName || ''} ${task.author?.firstName || ''}`;

		// Уведомляем исполнителя (если это не он сам создал)
		if (task.assigneeId !== task.authorId) {
			await this.sendToUser(task.assigneeId, message);
		}

		// Уведомляем руководителя, если notifyBoss = true
		if (task.notifyBoss) {
			const bossId = await this.getBossId(task.assigneeId);
			if (bossId && bossId !== task.authorId) {
				await this.sendToUser(bossId, `📋 <b>Новая задача для подчинённого</b>\n${message}`);
			}
		}
	}

	/**
	 * Уведомление об изменении задачи
	 */
	async notifyTaskUpdated(task: any, changes: string[], updatedById: number): Promise<void> {
		if (task.assigneeId === updatedById) return; // Исполнитель сам изменил

		const message = `✏️ <b>Задача изменена</b>
"${task.title}"
Изменения: ${changes.join(', ')}
${task.deadline ? `📅 Дедлайн: ${this.formatDate(new Date(task.deadline))}\n` : ''}${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

		await this.sendToUser(task.assigneeId, message);
	}

	/**
	 * Уведомление о смене статуса
	 */
	async notifyStatusChanged(task: any, oldStatus: string, newStatus: string, changedById: number): Promise<void> {
		const statusLabels: Record<string, string> = {
			pending: 'Ожидает',
			in_progress: 'В работе',
			completed: '✅ Выполнена',
			cancelled: '❌ Отменена',
		};

		const message = `🔄 <b>Статус задачи изменён</b>
"${task.title}"
${statusLabels[oldStatus] || oldStatus} → ${statusLabels[newStatus] || newStatus}
${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

		// Уведомляем автора, если статус изменил не он
		if (task.authorId !== changedById) {
			await this.sendToUser(task.authorId, message);
		}

		// Уведомляем руководителя, если notifyBoss = true
		if (task.notifyBoss) {
			const bossId = await this.getBossId(task.assigneeId);
			if (bossId && bossId !== changedById) {
				await this.sendToUser(bossId, message);
			}
		}
	}

	/**
	 * Крон: обработка напоминаний о задачах
	 * Вызывается каждые 30 минут
	 */
	async processTaskReminders(): Promise<{ processed: number; sent: number }> {
		const now = new Date();
		let processed = 0;
		let sent = 0;

		// Напоминание за 3 дня
		const in3Days = new Date(now);
		in3Days.setDate(in3Days.getDate() + 3);
		in3Days.setHours(23, 59, 59, 999);

		const tasks3Days = await this.crmTask.findMany({
			where: {
				deadline: { lte: in3Days, gt: now },
				reminderSent3Days: false,
				status: { in: ['pending', 'in_progress'] },
			},
			include: { assignee: true, organization: true },
		});

		for (const task of tasks3Days) {
			const message = `⏰ <b>Напоминание: задача через 3 дня</b>
"${task.title}"
📅 Дедлайн: ${this.formatDate(new Date(task.deadline!))}
${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

			await this.sendToUser(task.assigneeId, message);
			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent3Days: true },
			});
			processed++;
			sent++;
		}

		// Напоминание за 1 день
		const in1Day = new Date(now);
		in1Day.setDate(in1Day.getDate() + 1);
		in1Day.setHours(23, 59, 59, 999);

		const tasks1Day = await this.crmTask.findMany({
			where: {
				deadline: { lte: in1Day, gt: now },
				reminderSent1Day: false,
				status: { in: ['pending', 'in_progress'] },
			},
			include: { assignee: true, organization: true },
		});

		for (const task of tasks1Day) {
			const message = `⏰ <b>Напоминание: задача через 1 день</b>
"${task.title}"
📅 Дедлайн: ${this.formatDate(new Date(task.deadline!))}
${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

			await this.sendToUser(task.assigneeId, message);

			// Руководителю тоже, если notifyBoss
			if (task.notifyBoss) {
				const bossId = await this.getBossId(task.assigneeId);
				if (bossId) {
					await this.sendToUser(bossId, `⏰ <b>Напоминание: задача подчинённого через 1 день</b>\n${message}`);
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent1Day: true },
			});
			processed++;
			sent++;
		}

		// Напоминание за 2 часа
		const in2Hours = new Date(now);
		in2Hours.setHours(in2Hours.getHours() + 2);

		const tasks2Hours = await this.crmTask.findMany({
			where: {
				deadline: { lte: in2Hours, gt: now },
				reminderSent2Hours: false,
				status: { in: ['pending', 'in_progress'] },
			},
			include: { assignee: true, organization: true },
		});

		for (const task of tasks2Hours) {
			const message = `🚨 <b>Напоминание: задача через 2 часа!</b>
"${task.title}"
📅 Дедлайн: ${this.formatDate(new Date(task.deadline!))}
${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

			await this.sendToUser(task.assigneeId, message);

			if (task.notifyBoss) {
				const bossId = await this.getBossId(task.assigneeId);
				if (bossId) {
					await this.sendToUser(bossId, message);
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent2Hours: true },
			});
			processed++;
			sent++;
		}

		this.logger.log(`Task reminders processed: ${processed}, sent: ${sent}`);
		return { processed, sent };
	}

	/**
	 * Крон: обработка просроченных задач
	 * Вызывается ежедневно в 09:00
	 */
	async processOverdueTasks(): Promise<{ processed: number; sent: number }> {
		const now = new Date();
		let processed = 0;
		let sent = 0;

		const overdueTasks = await this.crmTask.findMany({
			where: {
				deadline: { lt: now },
				overdueNotified: false,
				status: { in: ['pending', 'in_progress'] },
			},
			include: { assignee: true, organization: true },
		});

		for (const task of overdueTasks) {
			const message = `🚨 <b>Задача просрочена!</b>
"${task.title}"
📅 Дедлайн был: ${this.formatDate(new Date(task.deadline!))}
${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;

			await this.sendToUser(task.assigneeId, message);

			if (task.notifyBoss) {
				const bossId = await this.getBossId(task.assigneeId);
				if (bossId) {
					await this.sendToUser(bossId, `🚨 <b>Задача подчинённого просрочена!</b>\n${message}`);
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { overdueNotified: true },
			});
			processed++;
			sent++;
		}

		this.logger.log(`Overdue tasks processed: ${processed}, sent: ${sent}`);
		return { processed, sent };
	}
}
