import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common';
import { TelegramService } from '../../notification/services/telegram.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';

@Injectable()
export class CalendarEventNotificationService extends PrismaService {
	private readonly logger = new Logger(CalendarEventNotificationService.name);

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	private readonly timeZone = 'Asia/Tashkent';

	/**
	 * Форматирование даты для сообщений (с учётом таймзоны)
	 */
	private formatDate(date: Date): string {
		const zonedDate = utcToZonedTime(date, this.timeZone);
		return format(zonedDate, 'd MMMM yyyy', { locale: ru });
	}

	/**
	 * Форматирование времени для сообщений (с учётом таймзоны)
	 */
	private formatTime(date: Date): string {
		const zonedDate = utcToZonedTime(date, this.timeZone);
		return format(zonedDate, 'HH:mm', { locale: ru });
	}

	/**
	 * Форматирование типа события
	 */
	private formatEventType(type: string): string {
		const types: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
			note: '📝 Заметка',
			reminder: '🔔 Напоминание',
		};
		return types[type] || type;
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
	 * Уведомление о создании события
	 */
	async notifyEventCreated(event: any): Promise<void> {
		// Уведомляем только если assignee !== author
		if (event.assigneeId === event.authorId) return;

		const message = `${this.formatEventType(event.type)} <b>создано для вас</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
📅 ${this.formatDate(new Date(event.dateStart))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}\n` : ''}${event.contact ? `👤 Контакт: ${event.contact.name}\n` : ''}👤 Автор: ${event.author?.lastName || ''} ${event.author?.firstName || ''}`;

		await this.sendToUser(event.assigneeId, message);

		// Уведомляем участников
		if (event.participants && event.participants.length > 0) {
			for (const participant of event.participants) {
				if (participant.userId !== event.authorId && participant.userId !== event.assigneeId) {
					await this.sendToUser(
						participant.userId,
						`📨 <b>Вас пригласили на ${this.formatEventType(event.type).toLowerCase()}</b>\n${message}`
					);
				}
			}
		}
	}

	/**
	 * Уведомление об изменении события
	 */
	async notifyEventUpdated(event: any, changes: string[], updatedById: number): Promise<void> {
		if (event.assigneeId === updatedById) return;

		const message = `✏️ <b>${this.formatEventType(event.type)} изменено</b>
"${event.title}"
Изменения: ${changes.join(', ')}
🕐 ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
📅 ${this.formatDate(new Date(event.dateStart))}
${event.location ? `📍 ${event.location}` : ''}`;

		await this.sendToUser(event.assigneeId, message);

		// Уведомляем участников
		if (event.participants) {
			for (const participant of event.participants) {
				if (participant.userId !== updatedById && participant.status === 'accepted') {
					await this.sendToUser(participant.userId, message);
				}
			}
		}
	}

	/**
	 * Уведомление об удалении события
	 */
	async notifyEventDeleted(event: any, deletedById: number): Promise<void> {
		if (event.assigneeId === deletedById) return;

		const message = `❌ <b>${this.formatEventType(event.type)} отменено</b>
"${event.title}"
📅 ${this.formatDate(new Date(event.dateStart))}
🕐 ${this.formatTime(new Date(event.dateStart))}`;

		await this.sendToUser(event.assigneeId, message);

		// Уведомляем участников
		if (event.participants) {
			for (const participant of event.participants) {
				if (participant.userId !== deletedById) {
					await this.sendToUser(participant.userId, message);
				}
			}
		}
	}

	/**
	 * Уведомление автору (руководителю) об изменении статуса события исполнителем
	 */
	async notifyEventStatusChanged(event: any, statusLabel: string, changedByUserId: number): Promise<void> {
		// Уведомляем автора события
		if (event.authorId === changedByUserId) return;

		const changedBy = await this.user.findUnique({
			where: { id: changedByUserId },
			select: { firstName: true, lastName: true },
		});

		const changedByName = changedBy ? `${changedBy.lastName || ''} ${changedBy.firstName || ''}`.trim() : 'Сотрудник';

		const message = `📋 <b>Статус события изменён</b>
"${event.title}"
Статус: <b>${statusLabel}</b>
Кем: ${changedByName}
📅 ${this.formatDate(new Date(event.dateStart))}
🕐 ${this.formatTime(new Date(event.dateStart))}${event.organization ? `\n🏢 ${(event.organization as any).nameRu || (event.organization as any).nameEn}` : ''}`;

		await this.sendToUser(event.authorId, message);
	}

	/**
	 * Крон: обработка напоминаний о событиях
	 */
	async processEventReminders(): Promise<{ processed: number; sent: number }> {
		const now = new Date();
		let processed = 0;
		let sent = 0;

		// Напоминание о встрече за 1 день
		const in1Day = new Date(now);
		in1Day.setDate(in1Day.getDate() + 1);
		in1Day.setHours(23, 59, 59, 999);

		const events1Day = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in1Day, gt: now },
				reminderSent1Day: false,
				type: { in: ['meeting', 'call'] },
			},
			include: { assignee: true, organization: true, contact: true },
		});

		for (const event of events1Day) {
			const message = `⏰ <b>${this.formatEventType(event.type)} завтра</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}` : ''}`;

			await this.sendToUser(event.assigneeId, message);
			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent1Day: true },
			});
			processed++;
			sent++;
		}

		// Напоминание о встрече за 2 часа
		const in2Hours = new Date(now);
		in2Hours.setHours(in2Hours.getHours() + 2);

		const events2Hours = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in2Hours, gt: now },
				reminderSent2Hours: false,
				type: 'meeting',
			},
			include: { assignee: true, organization: true, contact: true, participants: true },
		});

		for (const event of events2Hours) {
			const message = `📅 <b>Встреча через 2 часа</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}` : ''}`;

			await this.sendToUser(event.assigneeId, message);

			// Напоминаем принявшим участникам
			for (const participant of event.participants) {
				if (participant.status === 'accepted') {
					await this.sendToUser(participant.userId, message);
				}
			}

			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent2Hours: true },
			});
			processed++;
			sent++;
		}

		// Напоминание о звонке за 1 час
		const in1Hour = new Date(now);
		in1Hour.setHours(in1Hour.getHours() + 1);

		const calls1Hour = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in1Hour, gt: now },
				reminderSent1Hour: false,
				type: 'call',
			},
			include: { assignee: true, organization: true, contact: true },
		});

		for (const event of calls1Hour) {
			const message = `📞 <b>Звонок через 1 час</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))}
${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}\n` : ''}${event.contact ? `👤 Контакт: ${event.contact.name}` : ''}`;

			await this.sendToUser(event.assigneeId, message);
			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent1Hour: true },
			});
			processed++;
			sent++;
		}

		// Напоминания (type: reminder) — в указанное время
		const reminders = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: now },
				reminderFired: false,
				type: 'reminder',
			},
			include: { assignee: true, organization: true },
		});

		for (const reminder of reminders) {
			const message = `🔔 <b>Напоминание</b>
"${reminder.title}"
${reminder.description ? `${reminder.description}\n` : ''}${reminder.organization ? `🏢 ${reminder.organization.nameRu || reminder.organization.nameEn}` : ''}`;

			await this.sendToUser(reminder.assigneeId, message);
			await this.calendarEvent.update({
				where: { id: reminder.id },
				data: { reminderFired: true },
			});
			processed++;
			sent++;
		}

		this.logger.log(`Event reminders processed: ${processed}, sent: ${sent}`);
		return { processed, sent };
	}

	/**
	 * Крон: обработка пользовательских напоминаний
	 */
	async processCustomReminders(): Promise<{ processed: number; sent: number }> {
		const now = new Date();
		let processed = 0;
		let sent = 0;

		const reminders = await this.calendarReminder.findMany({
			where: {
				remindAt: { lte: now },
				isSent: false,
			},
			include: {
				event: {
					include: { organization: true },
				},
				user: true,
			},
		});

		for (const reminder of reminders) {
			const message = `🔔 <b>Напоминание о событии</b>
"${reminder.event.title}"
🕐 ${this.formatTime(new Date(reminder.event.dateStart))}
📅 ${this.formatDate(new Date(reminder.event.dateStart))}
${reminder.event.organization ? `🏢 ${reminder.event.organization.nameRu || reminder.event.organization.nameEn}` : ''}`;

			await this.sendToUser(reminder.userId, message);
			await this.calendarReminder.update({
				where: { id: reminder.id },
				data: { isSent: true },
			});
			processed++;
			sent++;
		}

		this.logger.log(`Custom reminders processed: ${processed}, sent: ${sent}`);
		return { processed, sent };
	}
}
