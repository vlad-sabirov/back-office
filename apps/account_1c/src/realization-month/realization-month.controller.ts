import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RealizationMonthService } from './realization-month.service';
import { RealizationMonthModel } from './models/realization-month-all.model';
import { IPingEntity } from '../entities/ping.entity';
import { ICreateDto } from './dto/create.dto';
import { IUpdateAllByDateDto } from './dto/update-all-by-date.dto';
import { IBuildAllByDateDto } from './dto/build-all-by-date.dto';
import { format, subMonths } from 'date-fns';

@Controller('realization/month')
export class RealizationMonthController {
	constructor(
		private readonly realizationMonthService: RealizationMonthService,
	) {}

	@Get('ping')
	async ping(): Promise<IPingEntity> {
		return {
			code: 200,
			status: 'success',
			data: 'pong',
		};
	}

	@Get('all')
	async getAll(): Promise<RealizationMonthModel[]> {
		return this.realizationMonthService.findAll();
	}

	@Get('byDate/:year/:month')
	async getByDate(
		@Param('year') year: number | string,
		@Param('month') month: number | string,
	): Promise<RealizationMonthModel> {
		return this.realizationMonthService.findByDate({ year, month });
	}

	@Get('buildByDateToday')
	async getByToday(): Promise<RealizationMonthModel> {
		const year = format(new Date(), 'yyyy');
		const month = format(new Date(), 'MM');
		return this.realizationMonthService.buildAllByDate({ year, month });
	}

	@Get('buildByDate12Months')
	async getBy12Months(): Promise<RealizationMonthModel[]> {
		const results: RealizationMonthModel[] = [];
		let currentDate = new Date();

		for (let i = 0; i < 12; i++) {
			const year = format(currentDate, 'yyyy');
			const month = format(currentDate, 'MM');

			const realization = await this.realizationMonthService.buildAllByDate({
				year,
				month,
			});
			results.push(realization);

			currentDate = subMonths(currentDate, 1);
		}

		return results;
	}

	@Post()
	async create(@Body() dto: ICreateDto): Promise<RealizationMonthModel> {
		return this.realizationMonthService.create(dto);
	}

	@Put()
	async update(@Body() dto: ICreateDto): Promise<RealizationMonthModel> {
		return this.realizationMonthService.update(dto);
	}

	@Patch('byDate')
	async patchByDate(
		@Body() dto: IUpdateAllByDateDto,
	): Promise<RealizationMonthModel> {
		return this.realizationMonthService.updateAllByDate(dto);
	}

	@Put('build/byDate')
	async buildAllByDate(
		@Body() dto: IBuildAllByDateDto,
	): Promise<RealizationMonthModel> {
		return this.realizationMonthService.buildAllByDate(dto);
	}
}
