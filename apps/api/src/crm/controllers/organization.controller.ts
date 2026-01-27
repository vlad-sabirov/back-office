import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Access } from 'src/auth/decorators/roles-auth.decorator';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { OrganizationVoipEntity } from 'src/crm/entity/organization-voip.entity';
import { MutationEmailDto, MutationOrganizationDto, MutationPhoneDto, QueryOrganizationDto } from '../dto';
import { IOrganizationInnEntity, OrganizationEntity } from '../entity';
import { OrganizationService } from '../services';
import { PrismaFilter } from 'src/helpers';
import { delay } from 'src/common';

@Controller('crm/organization')
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	async create(@Body() createDto: MutationOrganizationDto): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.findById(id, { requisites: true });
	}

	@Get('/deleteMe')
	async deleteMe(): Promise<any> {
		return await this.organizationService.deleteMe();
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryOrganizationDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryOrganizationDto,
		@Body('filter') filter?: PrismaFilter<Omit<OrganizationEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>,
		@Body('search') search?: string,
		@Body('power') power?: { medium: number; low: number; empty: number }
	): Promise<{ data: OrganizationEntity[]; total: number }> {
		await delay(process.env.DELAY);
		return await this.organizationService.findMany({ where, filter, include, search, power });
	}

	@Get('/findInnWithUser')
	async findInnWithUser(): Promise<IOrganizationInnEntity[]> {
		return this.organizationService.findInnWithUser();
	}

	@Get('/getVoip')
	async getVoip(): Promise<Record<string, OrganizationVoipEntity>> {
		return await this.organizationService.getVoip();
	}

	@Get('/count/unverified')
	async getCountUnverified(): Promise<number> {
		return this.organizationService.getCountUnverified();
	}

	@Post('/count/organizations')
	async getCountOrganizationsWithUserIds(@Body('userIds') userIds: number[]): Promise<number> {
		return this.organizationService.getCountOrganizationsWithUserIds(userIds);
	}

	@Patch('/toArchiveById/:id')
	async toArchiveById(@Param('id') id: number | string): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.toArchiveById(id);
	}

	@Patch('/fromArchiveById/:id')
	async fromArchiveById(@Param('id') id: number | string): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.fromArchiveById(id);
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body('updateDto') updateDto: Partial<MutationOrganizationDto>,
		@Body('phonesDto') phonesDto: MutationPhoneDto[],
		@Body('emailsDto') emailsDto: MutationEmailDto[],
		@Body('tagsDto') tagsDto: (number | string)[]
	): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.updateById({ id, updateDto, phonesDto, emailsDto, tagsDto });
	}

	@Patch('/updateAt')
	async updateAt(@Body('id') id: number | string): Promise<void> {
		await delay(process.env.DELAY);
		return await this.organizationService.updateAt({ id });
	}

	@Patch('/connectContactsById/:id')
	async connectContactsById(
		@Param('id') organizationId: number | string,
		@Body('contactIds') contactIds: (number | string)[]
	): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.connectContacts({ organizationId, contactIds });
	}

	@Patch('/connectTagsById/:id')
	async connectTagsById(
		@Param('id') organizationId: number | string,
		@Body('tagIds') tagIds: (number | string)[]
	): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.connectTags({ organizationId, tagIds });
	}

	@Patch('/searchIndexById/:id')
	async searchIndexById(@Param('id') organizationId: number | string): Promise<void> {
		await delay(process.env.DELAY);
		return await this.organizationService.searchIndexById(organizationId);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<OrganizationEntity> {
		await delay(process.env.DELAY);
		return await this.organizationService.deleteById(id);
	}

	@Get('/elastic/byPhone/:phone')
	@Access('user')
	@UseGuards(AccessGuard)
	async elasticGetByPhone(@Param('phone') phone: number | string) {
		return await this.organizationService.searchElasticByPhone({ request: phone });
	}
}
