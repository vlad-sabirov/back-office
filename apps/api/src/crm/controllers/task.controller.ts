import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Headers } from '@nestjs/common';
import { MutationTaskDto } from '../dto/mutation-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { TaskEntity } from '../entity/task.entity';
import { TaskService } from '../services/task.service';
import { delay } from '../../common';
import { TokenService } from '../../auth/services/token.service';

interface TaskFilter {
	orderBy?: { [key: string]: 'asc' | 'desc' };
	take?: number;
	skip?: number;
}

@Controller('crm/task')
export class TaskController {
	constructor(
		private readonly taskService: TaskService,
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
		@Body() createDto: MutationTaskDto,
		@Headers('authorization') authorization: string
	): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.taskService.create({ createDto, currentUserId });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		return await this.taskService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryTaskDto,
		@Body('filter') filter?: TaskFilter,
		@Body('include') include?: Record<string, boolean>
	): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		return await this.taskService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryTaskDto,
		@Body('filter') filter?: TaskFilter,
		@Body('include') include?: Record<string, boolean>
	): Promise<TaskEntity[]> {
		await delay(process.env.DELAY);
		return await this.taskService.findMany({ where, filter, include });
	}

	@Get('/byOrganizationId/:id')
	async getByOrganizationId(@Param('id') id: number | string): Promise<TaskEntity[]> {
		await delay(process.env.DELAY);
		return await this.taskService.getByOrganizationId(id);
	}

	@Get('/byAssigneeId/:id')
	async getByAssigneeId(@Param('id') id: number | string): Promise<TaskEntity[]> {
		await delay(process.env.DELAY);
		return await this.taskService.getByAssigneeId(id);
	}

	@Get('/my')
	async getMyTasks(@Headers('authorization') authorization: string): Promise<TaskEntity[]> {
		await delay(process.env.DELAY);
		const token = authorization?.replace('Bearer ', '');
		const payload = this.tokenService.validateAccessToken(token);
		return await this.taskService.getMyTasks(payload.id);
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationTaskDto>,
		@Headers('authorization') authorization: string
	): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.taskService.updateById({ id, updateDto, currentUserId });
	}

	@Patch('/byId/:id/status')
	async updateStatus(
		@Param('id') id: number | string,
		@Body('status') status: string,
		@Headers('authorization') authorization: string
	): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.taskService.updateStatus(id, status, currentUserId);
	}

	@Delete('/byId/:id')
	async deleteById(
		@Param('id') id: number | string,
		@Headers('authorization') authorization: string
	): Promise<TaskEntity> {
		await delay(process.env.DELAY);
		const currentUserId = this.getCurrentUserId(authorization);
		return await this.taskService.deleteById(id, currentUserId);
	}
}
