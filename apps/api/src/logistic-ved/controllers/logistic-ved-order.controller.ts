import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { LogisticVedOrderConstants } from '../constants/logistic-ved-order.constants';
import { CreateOrderLogisticVedDto } from '../dto/create-order.dto';
import { UpdateOrderLogisticVedDto } from '../dto/update-order.dto';
import { LogisticVedOrderEntity } from '../entity/logistic-ved-order.entity';
import { LogisticVedOrderService } from '../services/logistic-ved-order.service';

@Controller('logistic-ved-order')
export class LogisticVedOrderController {
	constructor(private readonly logisticVedOrderService: LogisticVedOrderService) {}

	@Post('/')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateOrderLogisticVedDto): Promise<LogisticVedOrderEntity> {
		return await this.logisticVedOrderService.create({
			...dto,
			authorId: Number(dto.authorId),
		});
	}

	@Get('/')
	async findAll(): Promise<LogisticVedOrderEntity[]> {
		return await this.logisticVedOrderService.findAll();
	}

	@Get('/findActive')
	async findActiveGet(): Promise<LogisticVedOrderEntity[]> {
		return await this.logisticVedOrderService.findActive();
	}

	@Post('/findActive')
	async findActive(
		@Body()
		{ userId, include }: { userId: number | string | number[] | string[]; include?: { [key: string]: any } }
	): Promise<LogisticVedOrderEntity[]> {
		return await this.logisticVedOrderService.findActive(userId, include);
	}

	@Get('/findActive/:userId')
	async findActiveGetWithUserId(@Param('userId') userId: number | string): Promise<LogisticVedOrderEntity[]> {
		return await this.logisticVedOrderService.findActive(Number(userId));
	}

	@Get('/findActiveWithRole/:role')
	async findActiveWithRole(@Param('role') role: string): Promise<LogisticVedOrderEntity[]> {
		return await this.logisticVedOrderService.findActiveWithRole(role);
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<LogisticVedOrderEntity> {
		const findStage = await this.logisticVedOrderService.findById(id);
		if (!findStage) throw new HttpException(LogisticVedOrderConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findStage;
	}

	@Get('/byName/:name')
	async findByName(@Param('name') name: string): Promise<LogisticVedOrderEntity> {
		const findStage = await this.logisticVedOrderService.findByName(name);
		if (!findStage) throw new HttpException(LogisticVedOrderConstants.ERROR_NAME_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findStage;
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() dto: UpdateOrderLogisticVedDto
	): Promise<LogisticVedOrderEntity> {
		await this.findById(id);
		return await this.logisticVedOrderService.updateById(id, dto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<LogisticVedOrderEntity> {
		await this.findById(id);
		return await this.logisticVedOrderService.deleteById(id);
	}
}
