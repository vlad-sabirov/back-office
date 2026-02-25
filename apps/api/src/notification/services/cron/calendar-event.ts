import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../../common';
import { TelegramService } from '../telegram.service';

@Injectable()
export class CronCalendarEventService extends PrismaService {
	private readonly logger = new Logger(CronCalendarEventService.name);

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
	 * Напоминание о встречах/звонках за 1 день (окно: 2ч–24ч)
	 */
	sendReminder1Day = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const lowerBound = new Date(now);
		lowerBound.setHours(lowerBound.getHours() + 2); // > 2 часов
		const in1Day = new Date(now);
		in1Day.setDate(in1Day.getDate() + 1);

		const events = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in1Day, gt: lowerBound }, // только окно 2ч–24ч
				reminderSent1Day: false,
				type: { in: ['meeting', 'call'] },
				// Пропускаем события с пользовательским напоминанием
				NOT: { reminders: { some: {} } },
			},
			include: { assignee: true, organization: true, contact: true },
		});

		let sentCount = 0;
		for (const event of events) {
			// Определяем "сегодня" или "завтра" по таймзоне
			const zonedNow = utcToZonedTime(now, this.timeZone);
			const zonedEvent = utcToZonedTime(new Date(event.dateStart), this.timeZone);
			const isToday = format(zonedNow, 'yyyy-MM-dd') === format(zonedEvent, 'yyyy-MM-dd');
			const dayLabel = isToday ? 'сегодня' : 'завтра';

			const message = `⏰ <b>${this.formatEventType(event.type)} — ${dayLabel}</b>
<b>Название:</b> ${event.title}
<b>Начало:</b> ${this.formatDate(new Date(event.dateStart))}, ${this.formatTime(new Date(event.dateStart))}
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
	 * Напоминание о встречах за 2 часа + участники (окно: 1ч–2ч)
	 */
	sendReminder2Hours = async (): Promise<{ sent: number }> => {
		const now = new Date();
		const lowerBound = new Date(now);
		lowerBound.setHours(lowerBound.getHours() + 1); // > 1 часа
		const in2Hours = new Date(now);
		in2Hours.setHours(in2Hours.getHours() + 2);

		const events = await this.calendarEvent.findMany({
			where: {
				dateStart: { lte: in2Hours, gt: lowerBound }, // только окно 1ч–2ч
				reminderSent2Hours: false,
				type: 'meeting',
				// Пропускаем события с пользовательским напоминанием
				NOT: { reminders: { some: {} } },
			},
			include: { assignee: true, organization: true, contact: true, participants: true },
		});

		let sentCount = 0;
		for (const event of events) {
			const message = `⏰ <b>${this.formatEventType(event.type)} через 2 часа</b>
<b>Название:</b> ${event.title}
<b>Начало:</b> ${this.formatTime(new Date(event.dateStart))} — ${this.formatTime(new Date(event.dateEnd))}
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
				// Пропускаем события с пользовательским напоминанием
				NOT: { reminders: { some: {} } },
			},
			include: { assignee: true, organization: true, contact: true },
		});

		let sentCount = 0;
		for (const event of events) {
			const message = `⏰ <b>${this.formatEventType(event.type)} через 1 час</b>
<b>Название:</b> ${event.title}
<b>Начало:</b> ${this.formatTime(new Date(event.dateStart))}
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
				task: {
					include: { organization: true },
				},
				user: true,
			},
		});

		let sentCount = 0;
		for (const reminder of reminders) {
			let message: string;

			if (reminder.event) {
				const ev = reminder.event as any;
				message = `🔔 <b>Напоминание: ${this.formatEventType(ev.type)}</b>
<b>Название:</b> ${ev.title}
<b>Начало:</b> ${this.formatDate(new Date(ev.dateStart))}, ${this.formatTime(new Date(ev.dateStart))}
${ev.dateEnd ? `<b>Окончание:</b> ${this.formatTime(new Date(ev.dateEnd))}\n` : ''}${ev.location ? `📍 ${ev.location}\n` : ''}${ev.organization ? `🏢 ${ev.organization.nameRu || ev.organization.nameEn}` : ''}`;
			} else if (reminder.task) {
				const task = reminder.task as any;
				message = `🔔 <b>Напоминание о задаче</b>
"${task.title}"
${task.deadline ? `📅 Дедлайн: ${this.formatDate(new Date(task.deadline))}, ${this.formatTime(new Date(task.deadline))}\n` : ''}${task.organization ? `🏢 ${task.organization.nameRu || task.organization.nameEn}` : ''}`;
			} else {
				// Нет ни события ни задачи — просто помечаем как отправленное
				await this.calendarReminder.update({
					where: { id: reminder.id },
					data: { isSent: true },
				});
				continue;
			}

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
	 * Сводка — все напоминания по событиям календаря
	 * Запускается автоматически каждые 5 минут с 7:00 до 22:00
	 */
	@Cron('*/5 7-22 * * *', { timeZone: 'Asia/Tashkent' })
	async checkAllEventReminders(): Promise<{
		reminder1Day: number;
		reminder2Hours: number;
		reminder1Hour: number;
		reminders: number;
		customReminders: number;
	}> {
		this.logger.log('Running scheduled calendar event reminders check...');
		const r1d = await this.sendReminder1Day();
		const r2h = await this.sendReminder2Hours();
		const r1h = await this.sendReminder1Hour();
		const rem = await this.processReminders();
		const custom = await this.processCustomReminders();

		const result = {
			reminder1Day: r1d.sent,
			reminder2Hours: r2h.sent,
			reminder1Hour: r1h.sent,
			reminders: rem.sent,
			customReminders: custom.sent,
		};
		this.logger.log(`Reminders check complete: ${JSON.stringify(result)}`);
		return result;
	}
}
