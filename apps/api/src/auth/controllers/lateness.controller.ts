import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaFilter } from 'src/helpers';
import { CreateLatenessDto, FindFixLatenessDto, FindLatenessDto, UpdateLatenessDto } from '../dto';
import { LatenessEntity } from '../entity';
import { LatenessService } from '../services';

@Controller('lateness')
export class LatenessController {
	constructor(private readonly latenessService: LatenessService) {}

	@Post()
	async create(@Body() createDto: CreateLatenessDto): Promise<LatenessEntity> {
		return await this.latenessService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<FindLatenessDto> {
		return await this.latenessService.findById(id);
	}

	@Post('/findOnce')
	async findOnce(
		@Body('where') where: FindLatenessDto,
		@Body('filter') filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessEntity> {
		return await this.latenessService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	async findMany(
		@Body('where') where: FindLatenessDto,
		@Body('filter') filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessEntity[]> {
		return await this.latenessService.findMany({ where, filter, include });
	}

	@Post('/findWithPass')
	async findWithPass(
		@Body('where') where: FindLatenessDto,
		@Body('filter') filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<LatenessEntity[]> {
		return await this.latenessService.findWithPass({ where, filter, include });
	}

	@Post('/findFixLateness')
	async findFixLateness(@Body() { userId, date, withoutFilter }: FindFixLatenessDto): Promise<LatenessEntity | null> {
		return await this.latenessService.findFixLateness({ userId, date, withoutFilter });
	}

	@Patch('/byId/:id')
	async updateById(@Param('id') id: number | string, @Body() updateDto: UpdateLatenessDto): Promise<LatenessEntity> {
		return await this.latenessService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<LatenessEntity> {
		return await this.latenessService.deleteById(id);
	}
}
