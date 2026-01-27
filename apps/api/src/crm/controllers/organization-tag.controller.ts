import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { MutationOrganizationTagDto, QueryOrganizationTagDto } from '../dto';
import { OrganizationTagEntity } from '../entity';
import { OrganizationTagService } from '../services';
import { PrismaFilter } from '../../helpers';

@Controller('crm/organization-tag')
export class OrganizationTagController {
	constructor(private readonly organizationTagService: OrganizationTagService) {}

	@Post()
	async create(@Body() createDto: MutationOrganizationTagDto): Promise<OrganizationTagEntity> {
		return await this.organizationTagService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<OrganizationTagEntity> {
		return await this.organizationTagService.findById(id);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryOrganizationTagDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationTagEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationTagEntity> {
		return await this.organizationTagService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryOrganizationTagDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationTagEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationTagEntity[]> {
		return await this.organizationTagService.findMany({ where, filter, include });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationOrganizationTagDto>
	): Promise<OrganizationTagEntity> {
		return await this.organizationTagService.updateById({ id, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<OrganizationTagEntity> {
		return await this.organizationTagService.deleteById(id);
	}
}
