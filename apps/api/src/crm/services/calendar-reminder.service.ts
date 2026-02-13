import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common';

interface CreateReminderDto {
	eventId: number;
	remindAt: Date | string;
}

interface CalendarReminderEntity {
	id: number;
	eventId: number;
	userId: number;
	remindAt: Date;
	isSent: boolean;
	createdAt: Date;
	event?: any;
	user?: any;
}

@Injectable()
export class CalendarReminderService extends PrismaService {
	private readonly logger = new Logger(CalendarReminderService.name);

	/**
	 * Создать напоминание о событии
	 */
	create = async (dto: CreateReminderDto, userId: number): Promise<CalendarReminderEntity> => {
		// Проверить, что событие существует
		const event = await this.calendarEvent.findUnique({
			where: { id: dto.eventId },
		});

		if (!event) {
			throw new HttpException('Событие не найдено', HttpStatus.NOT_FOUND);
		}

		// Проверить, что пользователь — участник или ответственный
		const isParticipant = await this.calendarEventParticipant.findUnique({
			where: {
				eventId_userId: { eventId: dto.eventId, userId },
			},
		});

		if (event.assigneeId !== userId && event.authorId !== userId && !isParticipant) {
			throw new HttpException('Вы не являетесь участником события', HttpStatus.FORBIDDEN);
		}

		const remindAt = new Date(dto.remindAt);

		// Проверить, что напоминание не в прошлом
		if (remindAt < new Date()) {
			throw new HttpException('Время напоминания не может быть в прошлом', HttpStatus.BAD_REQUEST);
		}

		// Проверить, что напоминание до начала события
		if (remindAt >= new Date(event.dateStart)) {
			throw new HttpException('Напоминание должно быть до начала события', HttpStatus.BAD_REQUEST);
		}

		// Проверить, нет ли уже такого напоминания
		const existing = await this.calendarReminder.findFirst({
			where: {
				eventId: dto.eventId,
				userId,
				isSent: false,
			},
		});

		if (existing) {
			// Обновить существующее напоминание
			return this.calendarReminder.update({
				where: { id: existing.id },
				data: { remindAt },
				include: { event: true },
			});
		}

		// Создать новое напоминание
		return this.calendarReminder.create({
			data: {
				eventId: dto.eventId,
				userId,
				remindAt,
			},
			include: { event: true },
		});
	};

	/**
	 * Удалить напоминание
	 */
	delete = async (id: number, userId: number): Promise<void> => {
		const reminder = await this.calendarReminder.findUnique({
			where: { id },
		});

		if (!reminder) {
			throw new HttpException('Напоминание не найдено', HttpStatus.NOT_FOUND);
		}

		// Только владелец может удалить напоминание
		if (reminder.userId !== userId) {
			throw new HttpException('Нет прав на удаление напоминания', HttpStatus.FORBIDDEN);
		}

		await this.calendarReminder.delete({
			where: { id },
		});
	};

	/**
	 * Получить напоминания пользователя
	 */
	getUserReminders = async (userId: number): Promise<CalendarReminderEntity[]> => {
		return this.calendarReminder.findMany({
			where: {
				userId,
				isSent: false,
				remindAt: { gt: new Date() },
			},
			include: {
				event: {
					include: { organization: true },
				},
			},
			orderBy: { remindAt: 'asc' },
		});
	};

	/**
	 * Получить напоминание по событию для пользователя
	 */
	getByEventId = async (eventId: number, userId: number): Promise<CalendarReminderEntity | null> => {
		return this.calendarReminder.findFirst({
			where: {
				eventId,
				userId,
				isSent: false,
			},
		});
	};

	/**
	 * Удалить все напоминания для события
	 */
	deleteByEventId = async (eventId: number): Promise<{ deleted: number }> => {
		const result = await this.calendarReminder.deleteMany({
			where: { eventId },
		});
		return { deleted: result.count };
	};
}
