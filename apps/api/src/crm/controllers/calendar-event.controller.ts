import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { MutationCalendarEventDto } from '../dto/mutation-calendar-event.dto';
import { QueryCalendarEventDto } from '../dto/query-calendar-event.dto';
import { CalendarEventService, RangeWithTasksResult } from '../services/calendar-event.service';
import { delay } from '../../common';
import { TokenService } from '../../auth/services/token.service';

interface CalendarEventFilter {
	orderBy?: { [key: string]: 'asc' | 'desc' };
	take?: number;
	skip?: number;
}

@Controller('crm/calendar-event')
export class CalendarEventController {
	constructor(
		private readonly calendarEventService: CalendarEventService,
		private readonly tokenService: TokenService
	) {}

	private getCurrentUserId(authorization: string): number | null {
		try {
			const token = authorization?.replace('Bearer ', '');
			const payload = this.tokenService.validateAccessToken(token);
			return payload?.id || null;
		} catch {
			return null;
		}
	}

	@Post()
	async create(
		@Body() createDto: MutationCalendarEventDto,
		@Headers('authorization') authorization: string
	): Promise<any> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.calendarEventService.create({ createDto, currentUserId });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<any> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.findById(id);
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryCalendarEventDto,
		@Body('filter') filter?: CalendarEventFilter
	): Promise<any[]> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.findMany({ where, filter });
	}

	/**
	 * События за период
	 * GET /crm/calendar-event/range?from=2026-02-01&to=2026-02-28&userId=1
	 */
	@Get('/range')
	async getByDateRange(
		@Query('from') from: string,
		@Query('to') to: string,
		@Query('userId') userId?: string
	): Promise<any[]> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.getByDateRange({
			from,
			to,
			userId: userId ? Number(userId) : undefined,
		});
	}

	/**
	 * События + задачи за период (для страницы календаря)
	 * GET /crm/calendar-event/range-with-tasks?from=2026-02-01&to=2026-02-28&userId=1
	 */
	@Get('/range-with-tasks')
	async getRangeWithTasks(
		@Query('from') from: string,
		@Query('to') to: string,
		@Query('userId') userId?: string
	): Promise<RangeWithTasksResult> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.getRangeWithTasks({
			from,
			to,
			userId: userId ? Number(userId) : undefined,
		});
	}

	/**
	 * План на сегодня (для виджета дашборда)
	 * GET /crm/calendar-event/today-plan
	 */
	@Get('/today-plan')
	async getTodayPlan(@Headers('authorization') authorization: string): Promise<RangeWithTasksResult> {
		await delay(process.env.DELAY);
		const token = authorization?.replace('Bearer ', '');
		const payload = this.tokenService.validateAccessToken(token);
		return await this.calendarEventService.getTodayPlan(payload.id);
	}

	@Get('/byOrganizationId/:id')
	async getByOrganizationId(@Param('id') id: number | string): Promise<any[]> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.getByOrganizationId(id);
	}

	@Get('/byContactId/:id')
	async getByContactId(@Param('id') id: number | string): Promise<any[]> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.getByContactId(id);
	}

	@Get('/byTaskId/:id')
	async getByTaskId(@Param('id') id: number | string): Promise<any[]> {
		await delay(process.env.DELAY);
		return await this.calendarEventService.getByTaskId(id);
	}

	@Patch('/byId/:id/status')
	async updateStatus(
		@Param('id') id: number | string,
		@Body('status') status: string,
		@Headers('authorization') authorization: string
	): Promise<any> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.calendarEventService.updateStatus({ id, status, currentUserId });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationCalendarEventDto>,
		@Headers('authorization') authorization: string
	): Promise<any> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.calendarEventService.updateById({ id, updateDto, currentUserId });
	}

	@Delete('/byId/:id')
	async deleteById(
		@Param('id') id: number | string,
		@Headers('authorization') authorization: string
	): Promise<any> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.calendarEventService.deleteById(id, currentUserId);
	}
}
