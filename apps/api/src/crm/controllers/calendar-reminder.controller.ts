import { Body, Controller, Delete, Get, Param, Post, Headers } from '@nestjs/common';
import { TokenService } from '../../auth/services/token.service';
import { CalendarReminderService } from '../services/calendar-reminder.service';

@Controller('crm/calendar-reminder')
export class CalendarReminderController {
	constructor(
		private readonly reminderService: CalendarReminderService,
		private readonly tokenService: TokenService
	) {}

	private getCurrentUserId(authorization: string): number {
		try {
			const token = authorization?.replace('Bearer ', '');
			const payload = this.tokenService.validateAccessToken(token);
			return payload?.id || 0;
		} catch {
			return 0;
		}
	}

	/**
	 * Создать напоминание о событии
	 * POST /crm/calendar-reminder
	 */
	@Post()
	async create(
		@Body() body: { eventId?: number; taskId?: number; remindAt: string },
		@Headers('authorization') authorization: string
	): Promise<any> {
		const userId = this.getCurrentUserId(authorization);
		return this.reminderService.create(body, userId);
	}

	/**
	 * Удалить напоминание
	 * DELETE /crm/calendar-reminder/:id
	 */
	@Delete('/:id')
	async delete(
		@Param('id') id: string,
		@Headers('authorization') authorization: string
	): Promise<void> {
		const userId = this.getCurrentUserId(authorization);
		return this.reminderService.delete(Number(id), userId);
	}

	/**
	 * Получить мои напоминания
	 * GET /crm/calendar-reminder/my
	 */
	@Get('/my')
	async getMyReminders(@Headers('authorization') authorization: string): Promise<any[]> {
		const userId = this.getCurrentUserId(authorization);
		return this.reminderService.getUserReminders(userId);
	}

	/**
	 * Получить напоминание по событию
	 * GET /crm/calendar-reminder/byEventId/:eventId
	 */
	@Get('/byEventId/:eventId')
	async getByEventId(
		@Param('eventId') eventId: string,
		@Headers('authorization') authorization: string
	): Promise<any> {
		const userId = this.getCurrentUserId(authorization);
		return this.reminderService.getByEventId(Number(eventId), userId);
	}
}
