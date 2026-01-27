import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { format } from 'date-fns';
import { FileService } from '../../file/file.service';
import { LogisticVedFileConstants } from '../constants/logistic-ved-file.constants';
import { CreateFileLogisticVedDto } from '../dto/create-file.dto';
import { LogisticVedFileEntity } from '../entity/logistic-ved-file.entity';
import { LogisticVedFileService } from '../services/logistic-ved-file.service';

@Controller('logistic-ved-file')
export class LogisticVedFileController {
	constructor(
		private readonly logisticVedFileService: LogisticVedFileService,
		private readonly fileService: FileService
	) {}

	@Post('/')
	// @UsePipes(new ValidationPipe())
	@UseInterceptors(FileInterceptor('file'))
	async create(
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: CreateFileLogisticVedDto
	): Promise<LogisticVedFileEntity> {
		const dateYear = format(new Date(), 'yyyy');
		const dateMonth = format(new Date(), 'MM');
		const { url } = file
			? await this.fileService.saveFile(file, {
					folder: `/logistic/ved/${dateYear}/${dateMonth}`,
			  })
			: { url: 'empty' };

		return await this.logisticVedFileService.create({ ...dto, url });
	}

	@Get('/')
	async findAll(): Promise<LogisticVedFileEntity[]> {
		return await this.logisticVedFileService.findAll();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<LogisticVedFileEntity> {
		const findFile = await this.logisticVedFileService.findById(id);
		if (!findFile) throw new HttpException(LogisticVedFileConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findFile;
	}

	@Get('/byType/:type')
	async findByType(@Param('type') type: string): Promise<LogisticVedFileEntity> {
		const findFile = await this.logisticVedFileService.findByType(type);
		if (!findFile) throw new HttpException(LogisticVedFileConstants.ERROR_TYPE_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findFile;
	}

	@Get('/byOrderId/:orderId')
	async findByOrderId(@Param('orderId') orderId: number | string): Promise<LogisticVedFileEntity[]> {
		const findFile = await this.logisticVedFileService.findByOrderId(orderId);
		if (!findFile.length)
			throw new HttpException(LogisticVedFileConstants.ERROR_ORDER_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findFile;
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<LogisticVedFileEntity> {
		const findFile = await this.logisticVedFileService.findById(id);
		if (!findFile) throw new HttpException(LogisticVedFileConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.logisticVedFileService.deleteById(id);
	}
}
