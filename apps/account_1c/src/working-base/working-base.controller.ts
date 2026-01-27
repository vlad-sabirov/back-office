import { Controller, Get, Param } from '@nestjs/common';
import { WorkingBaseService } from './working-base.service';
import { IPingEntity } from '../entities/ping.entity';
import { WorkingBaseModel } from './models/working-base.model';

@Controller('working-base')
export class WorkingBaseController {
	constructor(private readonly workingBaseService: WorkingBaseService) {}

	@Get('ping')
	async ping(): Promise<IPingEntity> {
		return {
			code: 200,
			status: 'success',
			data: 'pong',
		};
	}

	@Get('')
	async getAll(): Promise<Omit<WorkingBaseModel, 'organizations'>[]> {
		return await this.workingBaseService.getAll();
	}

	@Get('byDate/:year/:month')
	async getByDate(
		@Param('year') year: number | string,
		@Param('month') month: number | string,
	): Promise<Omit<WorkingBaseModel, 'organizations'>> {
		return await this.workingBaseService.getByDate({
			year: Number(year),
			month: Number(month),
		});
	}

	@Get('today')
	async updateWorkingBaseToday(): Promise<any> {
		return this.workingBaseService.updateWorkingBase({
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			mediumDuration: 30,
			lowDuration: 60,
			emptyDuration: 90,
		});
	}
}
