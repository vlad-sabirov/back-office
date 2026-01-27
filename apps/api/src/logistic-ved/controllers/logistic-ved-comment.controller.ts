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
import { LogisticVedCommentConstants } from '../constants/logistic-ved-comment.constants';
import { CreateCommentLogisticVedDto } from '../dto/create-comment.dto';
import { UpdateCommentLogisticVedDto } from '../dto/update-comment.dto';
import { LogisticVedCommentEntity } from '../entity/logistic-ved-comment.entity';
import { LogisticVedCommentService } from '../services/logistic-ved-comment.service';

@Controller('logistic-ved-comment')
export class LogisticVedCommentController {
	constructor(private readonly logisticVedCommentService: LogisticVedCommentService) {}

	@Post('/')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateCommentLogisticVedDto): Promise<LogisticVedCommentEntity> {
		return await this.logisticVedCommentService.create(dto);
	}

	@Get('/')
	async findAll(): Promise<LogisticVedCommentEntity[]> {
		return await this.logisticVedCommentService.findAll();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number): Promise<LogisticVedCommentEntity> {
		const findComment = await this.logisticVedCommentService.findById(id);

		if (!findComment) throw new HttpException(LogisticVedCommentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findComment;
	}

	@Get('/byComment/:comment')
	async findByComment(@Param('comment') comment: string): Promise<LogisticVedCommentEntity> {
		const findComment = await this.logisticVedCommentService.findByComment(comment);

		if (!findComment)
			throw new HttpException(LogisticVedCommentConstants.ERROR_COMMENT_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findComment;
	}

	@Get('/byAuthorId/:authorId')
	async findByAuthorId(@Param('authorId') authorId: number): Promise<LogisticVedCommentEntity[]> {
		const findComments = await this.logisticVedCommentService.findByAuthorId(authorId);

		if (!findComments.length)
			throw new HttpException(LogisticVedCommentConstants.ERROR_AUTHOR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findComments;
	}

	@Get('/byOrderId/:orderId')
	async findByOrderId(@Param('orderId') orderId: number): Promise<LogisticVedCommentEntity[]> {
		const findComments = await this.logisticVedCommentService.findByOrderId(orderId);

		if (!findComments.length)
			throw new HttpException(LogisticVedCommentConstants.ERROR_ORDER_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findComments;
	}

	@Patch('/byId/:id')
	@UsePipes(new ValidationPipe())
	async updateById(
		@Param('id') id: number,
		@Body() dto: UpdateCommentLogisticVedDto
	): Promise<LogisticVedCommentEntity> {
		const findComment = await this.logisticVedCommentService.findById(id);
		if (!findComment) throw new HttpException(LogisticVedCommentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.logisticVedCommentService.updateById(id, dto);
	}

	@Delete('/byId/:id')
	async delete(@Param('id') id: number): Promise<LogisticVedCommentEntity> {
		const findComment = await this.logisticVedCommentService.findById(id);
		if (!findComment) throw new HttpException(LogisticVedCommentConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.logisticVedCommentService.deleteById(id);
	}
}
