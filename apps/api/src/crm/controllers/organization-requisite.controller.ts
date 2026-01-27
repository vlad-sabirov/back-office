import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { MutationOrganizationRequisiteDto, QueryOrganizationRequisiteDto } from '../dto';
import { OrganizationRequisiteEntity } from '../entity';
import { OrganizationRequisiteService } from '../services';
import { PrismaFilter } from '../../helpers';

@Controller('crm/organization-requisite')
export class OrganizationRequisiteController {
	constructor(private readonly organizationRequisiteService: OrganizationRequisiteService) {}

	@Post()
	async create(@Body() createDto: MutationOrganizationRequisiteDto): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.findById(id);
	}

	@Get('/byInn/:inn')
	async findByInn(@Param('inn') inn: number | string): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.findByInn(inn);
	}

	@Get('/byCode1c/:code1c')
	async findByCode1c(@Param('code1c') code1c: string): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.findByCode1c(code1c);
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryOrganizationRequisiteDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationRequisiteEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryOrganizationRequisiteDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationRequisiteEntity, 'organizations'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationRequisiteEntity[]> {
		return await this.organizationRequisiteService.findMany({ where, filter, include });
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body() updateDto: Partial<MutationOrganizationRequisiteDto>
	): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.updateById({ id, updateDto });
	}

	@Patch('/byInn/:inn')
	async updateByInn(
		@Param('inn') inn: number | string,
		@Body() updateDto: Partial<MutationOrganizationRequisiteDto>
	): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.updateByInn({ inn, updateDto });
	}

	@Patch('/byCode1c/:code1c')
	async updateByCode1c(
		@Param('code1c') code1c: string,
		@Body() updateDto: Partial<MutationOrganizationRequisiteDto>
	): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.updateByCode1c({ code1c, updateDto });
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<OrganizationRequisiteEntity> {
		return await this.organizationRequisiteService.deleteById(id);
	}
}
