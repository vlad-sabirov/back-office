import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { IFeedDTO } from 'src/crm/dto/feed.dto';
import { MutationHistoryDto, QueryHistoryDto } from '../dto';
import { HistoryEntity } from '../entity';
import { HistoryService } from '../services';
import { PrismaFilter } from '../../helpers';
import { delay } from 'src/common';

@Controller('crm/history')
export class HistoryController {
	constructor(private readonly historyService: HistoryService) {}

	@Post()
	async create(@Body() createDto: MutationHistoryDto): Promise<HistoryEntity> {
		await delay(process.env.DELAY);
		return await this.historyService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<HistoryEntity> {
		await delay(process.env.DELAY);
		return await this.historyService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryHistoryDto,
		@Body('filter') filter?: PrismaFilter<Omit<HistoryEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<HistoryEntity> {
		await delay(process.env.DELAY);
		return await this.historyService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryHistoryDto,
		@Body('filter') filter?: PrismaFilter<Omit<HistoryEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<HistoryEntity[]> {
		await delay(process.env.DELAY);
		return await this.historyService.findMany({ where, filter, include });
	}

	@Post('/feed')
	@HttpCode(200)
	async search(@Body() dto: IFeedDTO): Promise<HistoryEntity[]> {
		await delay(process.env.DELAY);
		return await this.historyService.feed(dto);
	}

	@Get('/getByOrganizationId/:id')
	async getByOrganizationId(@Param('id') id: number | string): Promise<HistoryEntity[]> {
		await delay(process.env.DELAY);
		return await this.historyService.getByOrganizationId(id);
	}

	@Get('/getByContactId/:id')
	async getByContactId(@Param('id') id: number | string): Promise<HistoryEntity[]> {
		await delay(process.env.DELAY);
		return await this.historyService.getByContactId(id);
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationHistoryDto>
	): Promise<HistoryEntity> {
		await delay(process.env.DELAY);
		return await this.historyService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<HistoryEntity> {
		await delay(process.env.DELAY);
		return await this.historyService.deleteById(id);
	}
}
