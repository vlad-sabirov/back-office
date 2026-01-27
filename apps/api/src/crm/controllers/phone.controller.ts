import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MutationPhoneDto, QueryPhoneDto } from '../dto';
import { PhoneEntity } from '../entity';
import { PhoneService } from '../services';
import { PrismaFilter } from '../../helpers';

@Controller('crm/phone')
export class PhoneController {
	constructor(private readonly phoneService: PhoneService) {}

	@Post()
	async create(
		@Body() createDto: MutationPhoneDto,
	): Promise<PhoneEntity> {
		return await this.phoneService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<PhoneEntity> {
		return await this.phoneService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryPhoneDto,
		@Body('filter') filter?: PrismaFilter<Omit<PhoneEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<PhoneEntity> {
		return await this.phoneService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryPhoneDto,
		@Body('filter') filter?: PrismaFilter<Omit<PhoneEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<PhoneEntity[]> {
		return await this.phoneService.findMany({ where, filter, include });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<PhoneEntity> {
		return await this.phoneService.deleteById(id);
	}
}
