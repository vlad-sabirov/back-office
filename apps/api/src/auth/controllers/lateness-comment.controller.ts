import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaFilter } from '../../helpers';
import { CreateLatenessCommentDto, FindLatenessCommentDto, UpdateLatenessCommentDto } from '../dto';
import { LatenessCommentEntity } from '../entity';
import { LatenessCommentService } from '../services';

@Controller('lateness-comment')
export class LatenessCommentController {
	constructor(private readonly latenessCommentService: LatenessCommentService) {}

	@Post()
	async create(@Body() createDto: CreateLatenessCommentDto): Promise<LatenessCommentEntity> {
		return await this.latenessCommentService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<LatenessCommentEntity> {
		return await this.latenessCommentService.findById(id);
	}

	@Post('/findOnce')
	async findOnce(
		@Body('where') where: FindLatenessCommentDto,
		@Body('filter') filter?: PrismaFilter<Omit<LatenessCommentEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessCommentEntity> {
		return await this.latenessCommentService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	async findMany(
		@Body('where') where: FindLatenessCommentDto,
		@Body('filter') filter?: PrismaFilter<Omit<LatenessCommentEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessCommentEntity[]> {
		return await this.latenessCommentService.findMany({ where, filter, include });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: UpdateLatenessCommentDto
	): Promise<LatenessCommentEntity> {
		return await this.latenessCommentService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<LatenessCommentEntity> {
		return await this.latenessCommentService.deleteById(id);
	}
}
