import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common';

interface CreateReminderDto {
	eventId?: number;
	taskId?: number;
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
	 * Создать напоминание о событии или задаче
	 */
	create = async (dto: CreateReminderDto, userId: number): Promise<CalendarReminderEntity> => {
		const remindAt = new Date(dto.remindAt);

		if (remindAt < new Date()) {
			throw new HttpException('Время напоминания не может быть в прошлом', HttpStatus.BAD_REQUEST);
		}

		// === Напоминание для задачи ===
		if (dto.taskId) {
			const task = await this.crmTask.findUnique({ where: { id: dto.taskId } });
			if (!task) throw new HttpException('Задача не найдена', HttpStatus.NOT_FOUND);
			if (task.assigneeId !== userId && task.authorId !== userId) {
				throw new HttpException('Нет доступа к задаче', HttpStatus.FORBIDDEN);
			}

			const existing = await this.calendarReminder.findFirst({
				where: { taskId: dto.taskId, userId, isSent: false },
			});

			if (existing) {
				return this.calendarReminder.update({
					where: { id: existing.id },
					data: { remindAt },
					include: { task: true },
				});
			}

			return this.calendarReminder.create({
				data: { taskId: dto.taskId, userId, remindAt },
				include: { task: true },
			});
		}

		// === Напоминание для события ===
		if (!dto.eventId) {
			throw new HttpException('Укажите eventId или taskId', HttpStatus.BAD_REQUEST);
		}

		const event = await this.calendarEvent.findUnique({ where: { id: dto.eventId } });
		if (!event) throw new HttpException('Событие не найдено', HttpStatus.NOT_FOUND);

		const isParticipant = await this.calendarEventParticipant.findUnique({
			where: { eventId_userId: { eventId: dto.eventId, userId } },
		});

		if (event.assigneeId !== userId && event.authorId !== userId && !isParticipant) {
			throw new HttpException('Вы не являетесь участником события', HttpStatus.FORBIDDEN);
		}

		if (remindAt >= new Date(event.dateStart)) {
			throw new HttpException('Напоминание должно быть до начала события', HttpStatus.BAD_REQUEST);
		}

		const existing = await this.calendarReminder.findFirst({
			where: { eventId: dto.eventId, userId, isSent: false },
		});

		if (existing) {
			return this.calendarReminder.update({
				where: { id: existing.id },
				data: { remindAt },
				include: { event: true },
			});
		}

		return this.calendarReminder.create({
			data: { eventId: dto.eventId, userId, remindAt },
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
