import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { PrismaFilter } from 'src/helpers/prisma.filter';
import { FindVacationDto, CreateVacationDto, UpdateVacationDto } from '../dto';
import { VacationEntity } from '../entities/vacation.entity';
import { VacationCalendarService } from '../services';

@Controller('vacation-calendar')
export class VacationCalendarController {
	constructor(private readonly vacationCalendarService: VacationCalendarService) {}

	@Post()
	async create(@Body() createDto: CreateVacationDto): Promise<VacationEntity> {
		return this.vacationCalendarService.create(createDto);
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<VacationEntity> {
		return this.vacationCalendarService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: FindVacationDto,
		@Body('filter') filter?: PrismaFilter<VacationEntity>,
		@Body('include') include?: Record<string, boolean>
	): Promise<VacationEntity> {
		return this.vacationCalendarService.findOnce(where, filter, include);
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: FindVacationDto,
		@Body('filter') filter?: PrismaFilter<VacationEntity>,
		@Body('include') include?: Record<string, boolean>
	): Promise<VacationEntity[]> {
		return this.vacationCalendarService.findMany(where, filter, include);
	}

	@Post('/findBetweenDateRange')
	@HttpCode(200)
	async findBetweenDateRange(
		@Body('start') start: string,
		@Body('end') end: string,
		@Body('userId') userId?: number | string
	): Promise<{ userId: number; dates: Date[] }[]> {
		return this.vacationCalendarService.findBetweenDateRange({ start, end, userId });
	}

	@Patch('/byId/:id')
	async updateById(@Param('id') id: number | string, @Body() updateDto: UpdateVacationDto): Promise<VacationEntity> {
		return this.vacationCalendarService.updateById(id, updateDto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<VacationEntity> {
		return this.vacationCalendarService.deleteById(id);
	}
}
