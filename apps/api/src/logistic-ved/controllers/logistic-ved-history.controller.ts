import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { LogisticVedHistoryConstants } from '../constants/logistic-ved-history.constants';
import { CreateHistoryLogisticVedDto } from '../dto/create-history.dto';
import { LogisticVedHistoryEntity } from '../entity/logistic-ved-history.entity';
import { LogisticVedHistoryService } from '../services/logistic-ved-history.service';

@Controller('logistic-ved-history')
export class LogisticVedHistoryController {
	constructor(private readonly logisticVedHistoryService: LogisticVedHistoryService) {}

	@Post('/')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateHistoryLogisticVedDto): Promise<LogisticVedHistoryEntity> {
		return await this.logisticVedHistoryService.create(dto);
	}

	@Get('/')
	async findAll(): Promise<LogisticVedHistoryEntity[]> {
		return await this.logisticVedHistoryService.findAll();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<LogisticVedHistoryEntity> {
		const findHistory = await this.logisticVedHistoryService.findById(id);
		if (!findHistory) throw new HttpException(LogisticVedHistoryConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findHistory;
	}

	@Get('/byTitle/:title')
	async findByTitle(@Param('title') title: string): Promise<LogisticVedHistoryEntity> {
		const findHistory = await this.logisticVedHistoryService.findByTitle(title);
		if (!findHistory)
			throw new HttpException(LogisticVedHistoryConstants.ERROR_TITLE_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findHistory;
	}

	@Get('/byOrderId/:orderId')
	async findByOrderId(@Param('orderId') orderId: number | string): Promise<LogisticVedHistoryEntity[]> {
		const findHistory = await this.logisticVedHistoryService.findByOrderId(orderId);
		if (!findHistory.length)
			throw new HttpException(LogisticVedHistoryConstants.ERROR_ORDER_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findHistory;
	}

	@Delete('/byId/:id')
	async delete(@Param('id') id: number | string): Promise<LogisticVedHistoryEntity> {
		const findHistory = await this.logisticVedHistoryService.findById(id);
		if (!findHistory) throw new HttpException(LogisticVedHistoryConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.logisticVedHistoryService.deleteById(id);
	}
}
