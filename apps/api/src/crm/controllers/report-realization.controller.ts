import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { PrismaFilter } from 'src/helpers';
import { ReportRealizationEntity } from '../entity';
import { ReportRealizationService } from '../services';
import { MutationReportRealizationDto, QueryReportRealizationDto } from '../dto';

@Controller('crm/report/realization')
export class ReportRealizationController {
	constructor(private readonly reportRealizationService: ReportRealizationService) {}

	@Post()
	async create(@Body() createDto: MutationReportRealizationDto): Promise<ReportRealizationEntity> {
		return await this.reportRealizationService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<ReportRealizationEntity> {
		return await this.reportRealizationService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryReportRealizationDto,
		@Body('filter') filter?: PrismaFilter<Omit<ReportRealizationEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<ReportRealizationEntity> {
		return await this.reportRealizationService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryReportRealizationDto,
		@Body('filter') filter?: PrismaFilter<Omit<ReportRealizationEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<ReportRealizationEntity[]> {
		return await this.reportRealizationService.findMany({ where, filter, include });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationReportRealizationDto>
	): Promise<ReportRealizationEntity> {
		return await this.reportRealizationService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<ReportRealizationEntity> {
		return await this.reportRealizationService.deleteById(id);
	}
}
