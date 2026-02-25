import { Body, Controller, Delete, Get, Param, Post, Headers } from '@nestjs/common';
import { TokenService } from '../../auth/services/token.service';
import { CalendarParticipantService } from '../services/calendar-participant.service';

@Controller('crm/calendar-participant')
export class CalendarParticipantController {
	constructor(
		private readonly participantService: CalendarParticipantService,
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
	 * Добавить участников к событию
	 * POST /crm/calendar-participant/add
	 */
	@Post('/add')
	async addParticipants(
		@Body() body: { eventId: number; userIds: number[] },
		@Headers('authorization') authorization: string
	): Promise<{ added: number }> {
		const userId = this.getCurrentUserId(authorization);
		return this.participantService.addParticipants(body, userId);
	}

	/**
	 * Удалить участника
	 * DELETE /crm/calendar-participant/:eventId/:userId
	 */
	@Delete('/:eventId/:userId')
	async removeParticipant(
		@Param('eventId') eventId: string,
		@Param('userId') participantUserId: string,
		@Headers('authorization') authorization: string
	): Promise<void> {
		const currentUserId = this.getCurrentUserId(authorization);
		return this.participantService.removeParticipant(Number(eventId), Number(participantUserId), currentUserId);
	}

	/**
	 * Принять/отклонить приглашение
	 * POST /crm/calendar-participant/respond
	 */
	@Post('/respond')
	async respondToInvitation(
		@Body() body: { eventId: number; status: 'accepted' | 'declined' },
		@Headers('authorization') authorization: string
	): Promise<{ status: string }> {
		const userId = this.getCurrentUserId(authorization);
		return this.participantService.updateStatus(
			{ eventId: body.eventId, userId, status: body.status },
			userId
		);
	}

	/**
	 * Получить участников события
	 * GET /crm/calendar-participant/byEventId/:eventId
	 */
	@Get('/byEventId/:eventId')
	async getEventParticipants(@Param('eventId') eventId: string): Promise<any[]> {
		return this.participantService.getEventParticipants(Number(eventId));
	}

	/**
	 * Получить все участия пользователя во встречах
	 * GET /crm/calendar-participant/byUserId/:userId
	 */
	@Get('/byUserId/:userId')
	async getByUserId(@Param('userId') userId: string): Promise<any[]> {
		return this.participantService.getUserParticipations(Number(userId));
	}

	/**
	 * Получить мои приглашения (pending)
	 * GET /crm/calendar-participant/my-invitations
	 */
	@Get('/my-invitations')
	async getMyInvitations(@Headers('authorization') authorization: string): Promise<any[]> {
		const userId = this.getCurrentUserId(authorization);
		return this.participantService.getUserInvitations(userId);
	}
}
