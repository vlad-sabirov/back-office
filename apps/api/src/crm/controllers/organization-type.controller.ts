import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { MutationOrganizationTypeDto, QueryOrganizationTypeDto } from '../dto';
import { OrganizationTypeEntity } from '../entity';
import { OrganizationTypeService } from '../services';
import { PrismaFilter } from '../../helpers';
import { delay } from 'src/common';

@Controller('crm/organization-type')
export class OrganizationTypeController {
	constructor(private readonly organizationTypeService: OrganizationTypeService) {}

	@Post()
	async create(@Body() createDto: MutationOrganizationTypeDto): Promise<OrganizationTypeEntity> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<OrganizationTypeEntity> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryOrganizationTypeDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationTypeEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationTypeEntity> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryOrganizationTypeDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationTypeEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationTypeEntity[]> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.findMany({ where, filter, include });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationOrganizationTypeDto>
	): Promise<OrganizationTypeEntity> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<OrganizationTypeEntity> {
		await delay(process.env.DELAY);
		return await this.organizationTypeService.deleteById(id);
	}
}
