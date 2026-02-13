import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PrismaService } from '../../../common';
import { TelegramService } from '../telegram.service';

@Injectable()
export class CronCalendarEventService extends PrismaService {
	private readonly logger = new Logger(CronCalendarEventService.name);

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	/**
	 * Форматирование даты для сообщений
	 */
	private formatDate(date: Date): string {
		return format(date, 'd MMMM yyyy', { locale: ru });
	}

	/**
	 * Форматирование времени для сообщений
	 */
	private formatTime(date: Date): string {
		return format(date, 'HH:mm', { locale: ru });
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
	private async sendToUser(userId: number, message: string): Promise<boolean> {
		try {
			const user = await this.user.findUnique({
				where: { id: userId },
				select: { telegramId: true, firstName: true, lastName: true },
			});

			if (user?.telegramId) {
				await this.telegramService.sendMessage(Number(user.telegramId), message);
				this.logger.log(`Sent notification to user ${userId} (${user.lastName} ${user.firstName})`);
				return true;
			}
			return false;
		} catch (error) {
			this.logger.error(`Failed to send notification to user ${userId}:`, error);
			return false;
		}
	}

	/**
	 * Напоминание о встречах/звонках за 1 день
	 */
	sendReminder1Day = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const in1Day = new Date(now);
		in1Day.setDate(in1Day.getDate() + 1);
		in1Day.setHours(23, 59, 59, 999);

		const events = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in1Day, gt: now },
				reminderSent1Day: false,
				type: { in: ['meeting', 'call'] },
			},
			include: { assignee: true, organization: true, contact: true },
		});

		let sentCount = 0;
		for (const event of events) {
			const message = `⏰ <b>${this.formatEventType(event.type)} завтра</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}` : ''}`;

			if (await this.sendToUser(event.assigneeId, message)) {
				sentCount++;
			}

			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent1Day: true },
			});
		}

		this.logger.log(`Calendar 1-day reminders sent: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Напоминание о встречах за 2 часа + участники
	 */
	sendReminder2Hours = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const in2Hours = new Date(now);
		in2Hours.setHours(in2Hours.getHours() + 2);

		const events = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in2Hours, gt: now },
				reminderSent2Hours: false,
				type: 'meeting',
			},
			include: { assignee: true, organization: true, contact: true, participants: true },
		});

		let sentCount = 0;
		for (const event of events) {
			const message = `📅 <b>Встреча через 2 часа</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
${event.location ? `📍 ${event.location}\n` : ''}${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}` : ''}`;

			if (await this.sendToUser(event.assigneeId, message)) {
				sentCount++;
			}

			// Напоминаем принявшим участникам
			for (const participant of event.participants) {
				if (participant.status === 'accepted') {
					if (await this.sendToUser(participant.userId, message)) {
						sentCount++;
					}
				}
			}

			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent2Hours: true },
			});
		}

		this.logger.log(`Calendar 2-hour reminders sent: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Напоминание о звонках за 1 час
	 */
	sendReminder1Hour = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const in1Hour = new Date(now);
		in1Hour.setHours(in1Hour.getHours() + 1);

		const events = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in1Hour, gt: now },
				reminderSent1Hour: false,
				type: 'call',
			},
			include: { assignee: true, organization: true, contact: true },
		});

		let sentCount = 0;
		for (const event of events) {
			const message = `📞 <b>Звонок через 1 час</b>
"${event.title}"
🕐 ${this.formatTime(new Date(event.dateStart))}
${event.organization ? `🏢 ${event.organization.nameRu || event.organization.nameEn}\n` : ''}${event.contact ? `👤 Контакт: ${event.contact.name}` : ''}`;

			if (await this.sendToUser(event.assigneeId, message)) {
				sentCount++;
			}

			await this.calendarEvent.update({
				where: { id: event.id },
				data: { reminderSent1Hour: true },
			});
		}

		this.logger.log(`Calendar 1-hour reminders sent: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Обработка событий типа "reminder" — срабатывают в указанное время
	 */
	processReminders = async (): Promise<{ sent: number }> => {
		const now = new Date();

		const reminders = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: now },
				reminderFired: false,
				type: 'reminder',
			},
			include: { assignee: true, organization: true },
		});

		let sentCount = 0;
		for (const reminder of reminders) {
			const message = `🔔 <b>Напоминание</b>
"${reminder.title}"
${reminder.description ? `${reminder.description}\n` : ''}${reminder.organization ? `🏢 ${reminder.organization.nameRu || reminder.organization.nameEn}` : ''}`;

			if (await this.sendToUser(reminder.assigneeId, message)) {
				sentCount++;
			}

			await this.calendarEvent.update({
				where: { id: reminder.id },
				data: { reminderFired: true },
			});
		}

		this.logger.log(`Reminder events processed: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Обработка пользовательских напоминаний (CalendarReminder)
	 */
	processCustomReminders = async (): Promise<{ sent: number }> => {
		const now = new Date();

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

		let sentCount = 0;
		for (const reminder of reminders) {
			const message = `🔔 <b>Напоминание о событии</b>
"${reminder.event.title}"
🕐 ${this.formatTime(new Date(reminder.event.dateStart))}
📅 ${this.formatDate(new Date(reminder.event.dateStart))}
${reminder.event.organization ? `🏢 ${reminder.event.organization.nameRu || reminder.event.organization.nameEn}` : ''}`;

			if (await this.sendToUser(reminder.userId, message)) {
				sentCount++;
			}

			await this.calendarReminder.update({
				where: { id: reminder.id },
				data: { isSent: true },
			});
		}

		this.logger.log(`Custom reminders processed: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Сводка — все напоминания по событиям календаря (запускается каждые 30 минут)
	 */
	checkAllEventReminders = async (): Promise<{
		reminder1Day: number;
		reminder2Hours: number;
		reminder1Hour: number;
		reminders: number;
		customReminders: number;
	}> => {
		const r1d = await this.sendReminder1Day();
		const r2h = await this.sendReminder2Hours();
		const r1h = await this.sendReminder1Hour();
		const rem = await this.processReminders();
		const custom = await this.processCustomReminders();

		return {
			reminder1Day: r1d.sent,
			reminder2Hours: r2h.sent,
			reminder1Hour: r1h.sent,
			reminders: rem.sent,
			customReminders: custom.sent,
		};
	};
}
