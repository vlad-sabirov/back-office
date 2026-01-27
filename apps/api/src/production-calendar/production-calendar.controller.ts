import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PrismaSortDto } from 'src/common';
import { CreateEventDto, FilterEventDto, UpdateEventDto } from './dto';
import { ProductionCalendarEntity } from './entities';
import { ProductionCalendarService } from './production-calendar.service';

@Controller('production-calendar')
export class ProductionCalendarController {
	constructor(private productionCalendarService: ProductionCalendarService) {}

	@Post('')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateEventDto): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.create(dto);
	}

	@Get('findById/:id')
	async findById(@Param('id') id: number | string): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.findById(id);
	}

	@Post('findOnce')
	async findOnce(
		@Body('filter') filter: FilterEventDto,
		@Body('sort') sort?: PrismaSortDto
	): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.findOnce(filter, sort);
	}

	@Post('findMany')
	async findMany(
		@Body('filter') filter: FilterEventDto,
		@Body('sort') sort?: PrismaSortDto
	): Promise<ProductionCalendarEntity[]> {
		return await this.productionCalendarService.findMany(filter, sort);
	}

	@Post('findBetweenDateRange')
	async findBetweenDateRange(@Body('start') start: string, @Body('end') end?: string): Promise<Date[]> {
		return await this.productionCalendarService.findBetweenDateRange({ start, end });
	}

	@Patch('byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(@Param('id') id: number | string, @Body() dto: UpdateEventDto): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.updateById(id, dto);
	}

	@Delete('byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.deleteById(id);
	}

	@Delete('hideById/:id')
	async hideById(@Param('id') id: number | string): Promise<ProductionCalendarEntity> {
		return await this.productionCalendarService.hideById(id);
	}
}
