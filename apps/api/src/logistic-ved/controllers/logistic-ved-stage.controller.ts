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
import { LogisticVedStageConstants } from '../constants/logistic-ved-stage.constants';
import { CreateStageLogisticVedDto } from '../dto/create-stage.dto';
import { FindStageWithOrderOptions } from '../dto/find-stage-with-order-options';
import { ResortStageLogisticVedDto } from '../dto/resort-stage.dto';
import { UpdateStageLogisticVedDto } from '../dto/update-stage.dto';
import { LogisticVedStageEntity } from '../entity/logistic-ved-stage.entity';
import { LogisticVedStageService } from '../services/logistic-ved-stage.service';

@Controller('logistic-ved-stage')
export class LogisticVedStageController {
	constructor(private readonly logisticVedStageService: LogisticVedStageService) {}

	@Post()
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateStageLogisticVedDto): Promise<LogisticVedStageEntity> {
		const { name, alias } = dto;

		if (dto.errorTime <= dto.warningTime)
			throw new HttpException(
				LogisticVedStageConstants.ERROR_WARNING_TIME_NOT_LESS_ERROR_TIME,
				HttpStatus.BAD_REQUEST
			);

		const findDuplicateAlias = await this.logisticVedStageService.findByAlias(alias);
		if (findDuplicateAlias)
			throw new HttpException(LogisticVedStageConstants.ERROR_ALIAS_DUPLICATE, HttpStatus.BAD_REQUEST);

		const findDuplicateName = await this.logisticVedStageService.findByName(name);
		if (findDuplicateName)
			throw new HttpException(LogisticVedStageConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.logisticVedStageService.create(dto);
	}

	@Get('/')
	async findAll(): Promise<LogisticVedStageEntity[] | null> {
		return await this.logisticVedStageService.findAll();
	}

	@Post('/findWithActiveOrders')
	async findWithActiveOrders(
		@Body()
		options: FindStageWithOrderOptions
	): Promise<LogisticVedStageEntity[] | null> {
		return await this.logisticVedStageService.findWithOrderOptions(options);
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number): Promise<LogisticVedStageEntity | null> {
		const findStage = await this.logisticVedStageService.findById(id);
		if (!findStage) throw new HttpException(LogisticVedStageConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findStage;
	}

	@Get('/byAlias/:alias')
	async findByAlias(@Param('alias') alias: string): Promise<LogisticVedStageEntity | null> {
		const findStage = await this.logisticVedStageService.findByAlias(alias);
		if (!findStage) throw new HttpException(LogisticVedStageConstants.ERROR_ALIAS_DUPLICATE, HttpStatus.NOT_FOUND);

		return findStage;
	}

	@Get('/byName/:name')
	async findByName(@Param('name') name: string): Promise<LogisticVedStageEntity | null> {
		const findStage = await this.logisticVedStageService.findByName(name);
		if (!findStage) throw new HttpException(LogisticVedStageConstants.ERROR_NAME_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findStage;
	}

	@Get('/nextPositionById/:id')
	async nextPositionById(@Param('id') id: string): Promise<LogisticVedStageEntity | null> {
		return await this.logisticVedStageService.findNextPosition(id);
	}

	@Get('/prevPositionById/:id')
	async predPositionById(@Param('id') id: string): Promise<LogisticVedStageEntity | null> {
		return await this.logisticVedStageService.findPrevPosition(id);
	}

	@Patch('/byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(@Param('id') id: number, @Body() dto: UpdateStageLogisticVedDto): Promise<LogisticVedStageEntity> {
		const { name, alias } = dto;
		if (dto.errorTime <= dto.warningTime)
			throw new HttpException(
				LogisticVedStageConstants.ERROR_WARNING_TIME_NOT_LESS_ERROR_TIME,
				HttpStatus.BAD_REQUEST
			);

		const findStage = await this.findById(id);

		const findDuplicateAlias = await this.logisticVedStageService.findByAlias(alias);
		if (findDuplicateAlias && findDuplicateAlias.id !== findStage.id)
			throw new HttpException(LogisticVedStageConstants.ERROR_ALIAS_DUPLICATE, HttpStatus.BAD_REQUEST);

		const findDuplicateName = await this.logisticVedStageService.findByName(name);
		if (findDuplicateName && findDuplicateName.id !== findStage.id)
			throw new HttpException(LogisticVedStageConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.logisticVedStageService.updateById(id, dto);
	}

	@Patch('/resort')
	async resort(@Body() dto: ResortStageLogisticVedDto[]): Promise<void> {
		await this.logisticVedStageService.resort(dto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number): Promise<LogisticVedStageEntity> {
		await this.findById(id);
		return await this.logisticVedStageService.deleteById(id);
	}
}
