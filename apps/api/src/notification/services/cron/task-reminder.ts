import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PrismaService } from '../../../common';
import { TelegramService } from '../telegram.service';
import { UserService } from '../../../user/user.service';

@Injectable()
export class CronTaskReminderService extends PrismaService {
	constructor(
		private readonly telegramService: TelegramService,
		private readonly userService: UserService
	) {
		super();
	}

	/**
	 * Проверка дедлайнов за 3 дня
	 */
	sendReminder3Days = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const targetDate = new Date(now);
		targetDate.setDate(targetDate.getDate() + 3);

		const tasks = await this.crmTask.findMany({
			where: {
				deadline: {
					lte: targetDate,
					gt: now,
				},
				status: { notIn: ['completed', 'cancelled'] },
				reminderSent3Days: false,
			},
			include: { author: true, assignee: true, organization: true },
		});

		let sentCount = 0;
		for (const task of tasks) {
			const assignee = task.assignee as any;
			if (assignee?.telegramId) {
				const message = this.buildReminderMessage(task, '📋 Приближается дедлайн (3 дня)');
				await this.telegramService.sendMessage(Number(assignee.telegramId), message);
				sentCount++;
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent3Days: true },
			});
		}

		return { sent: sentCount };
	};

	/**
	 * Проверка дедлайнов за 1 день - уведомляем исполнителя + руководителя (если notifyBoss = true)
	 */
	sendReminder1Day = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const targetDate = new Date(now);
		targetDate.setDate(targetDate.getDate() + 1);

		const tasks = await this.crmTask.findMany({
			where: {
				deadline: {
					lte: targetDate,
					gt: now,
				},
				status: { notIn: ['completed', 'cancelled'] },
				reminderSent1Day: false,
			},
			include: { author: true, assignee: true, organization: true },
		});

		let sentCount = 0;
		for (const task of tasks) {
			const assignee = task.assignee as any;

			// Уведомить исполнителя
			if (assignee?.telegramId) {
				const message = this.buildReminderMessage(task, '🔔 Напоминание (1 день до дедлайна)');
				await this.telegramService.sendMessage(Number(assignee.telegramId), message);
				sentCount++;
			}

			// Уведомить руководителя (parent исполнителя) — только если notifyBoss = true
			if (task.notifyBoss && assignee?.id) {
				const fullAssignee = await this.userService.findById(assignee.id);
				if (fullAssignee?.parent?.telegramId) {
					const parentName = fullAssignee.parent.firstName || '';
					const messageForParent = this.buildReminderMessage(task, '🔔 Напоминание (1 день до дедлайна)', parentName);
					await this.telegramService.sendMessage(Number(fullAssignee.parent.telegramId), messageForParent);
					sentCount++;
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent1Day: true },
			});
		}

		return { sent: sentCount };
	};

	/**
	 * Срочное напоминание за 2 часа - уведомляем исполнителя + руководителя (если notifyBoss = true)
	 */
	sendReminder2Hours = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const targetDate = new Date(now);
		targetDate.setHours(targetDate.getHours() + 2);

		const tasks = await this.crmTask.findMany({
			where: {
				deadline: {
					lte: targetDate,
					gt: now,
				},
				status: { notIn: ['completed', 'cancelled'] },
				reminderSent2Hours: false,
			},
			include: { author: true, assignee: true, organization: true },
		});

		let sentCount = 0;
		for (const task of tasks) {
			const assignee = task.assignee as any;

			// Уведомить исполнителя
			if (assignee?.telegramId) {
				const message = this.buildReminderMessage(task, '⚠️ СРОЧНО! До дедлайна 2 часа');
				await this.telegramService.sendMessage(Number(assignee.telegramId), message);
				sentCount++;
			}

			// Уведомить руководителя — только если notifyBoss = true
			if (task.notifyBoss && assignee?.id) {
				const fullAssignee = await this.userService.findById(assignee.id);
				if (fullAssignee?.parent?.telegramId) {
					const parentName = fullAssignee.parent.firstName || '';
					const messageForParent = this.buildReminderMessage(task, '⚠️ СРОЧНО! До дедлайна 2 часа', parentName);
					await this.telegramService.sendMessage(Number(fullAssignee.parent.telegramId), messageForParent);
					sentCount++;
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { reminderSent2Hours: true },
			});
		}

		return { sent: sentCount };
	};

	/**
	 * Уведомление о просроченных задачах
	 */
	sendOverdueNotifications = async (): Promise<{ sent: number }> => {
		const now = new Date();

		const tasks = await this.crmTask.findMany({
			where: {
				deadline: { lt: now },
				status: { notIn: ['completed', 'cancelled'] },
				overdueNotified: false,
			},
			include: { author: true, assignee: true, organization: true },
		});

		let sentCount = 0;
		for (const task of tasks) {
			const assignee = task.assignee as any;

			// Уведомить исполнителя
			if (assignee?.telegramId) {
				const message = this.buildOverdueMessage(task);
				await this.telegramService.sendMessage(Number(assignee.telegramId), message);
				sentCount++;
			}

			// Уведомить руководителя — только если notifyBoss = true
			if (task.notifyBoss && assignee?.id) {
				const fullAssignee = await this.userService.findById(assignee.id);
				if (fullAssignee?.parent?.telegramId) {
					const parentName = fullAssignee.parent.firstName || '';
					const messageForParent = this.buildOverdueMessage(task, parentName);
					await this.telegramService.sendMessage(Number(fullAssignee.parent.telegramId), messageForParent);
					sentCount++;
				}
			}

			await this.crmTask.update({
				where: { id: task.id },
				data: { overdueNotified: true },
			});
		}

		return { sent: sentCount };
	};

	/**
	 * Сводка по всем дедлайнам
	 * Запускается автоматически каждые 5 минут с 7:00 до 22:00
	 */
	@Cron('*/5 7-22 * * *')
	async checkAllDeadlines(): Promise<{ reminder3Days: number; reminder1Day: number; reminder2Hours: number; overdue: number }> {
		const r3 = await this.sendReminder3Days();
		const r1 = await this.sendReminder1Day();
		const r2h = await this.sendReminder2Hours();
		const overdue = await this.sendOverdueNotifications();

		return {
			reminder3Days: r3.sent,
			reminder1Day: r1.sent,
			reminder2Hours: r2h.sent,
			overdue: overdue.sent,
		};
	}

	// ==================== Private ====================

	private priorityLabels: Record<string, string> = {
		low: '🟢 Низкий',
		normal: '🔵 Обычный',
		high: '🟠 Высокий',
		urgent: '🔴 Срочный',
	};

	private buildReminderMessage = (task: any, header: string, recipientName?: string): string => {
		const organization = task.organization as any;
		const assignee = task.assignee as any;
		const author = task.author as any;
		const name = recipientName || assignee?.firstName || '';

		let message = `${header}\n\n`;
		message += `<b>${name}</b>, напоминаем о задаче:\n\n`;
		message += `<b>От кого:</b> ${author?.firstName || ''} ${author?.lastName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n`;
		message += `<b>Приоритет:</b> ${this.priorityLabels[task.priority] || task.priority}\n`;

		if (task.deadline) {
			message += `<b>Дедлайн:</b> ${format(new Date(task.deadline), 'd MMMM yyyy, HH:mm', { locale: ru })}\n`;
		}

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		return message;
	};

	private buildOverdueMessage = (task: any, recipientName?: string): string => {
		const organization = task.organization as any;
		const assignee = task.assignee as any;
		const author = task.author as any;
		const name = recipientName || assignee?.firstName || '';

		let message = `🚨 <b>${name}</b>, задача просрочена!\n\n`;
		message += `<b>От кого:</b> ${author?.firstName || ''} ${author?.lastName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n`;
		message += `<b>Приоритет:</b> ${this.priorityLabels[task.priority] || task.priority}\n`;

		if (task.deadline) {
			message += `<b>Дедлайн был:</b> ${format(new Date(task.deadline), 'd MMMM yyyy, HH:mm', { locale: ru })}\n`;
		}

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		message += `\n⚠️ <i>Требуется срочное выполнение!</i>`;

		return message;
	};
}
