import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Access } from 'src/auth/decorators/roles-auth.decorator';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { delay } from 'src/common';
import { OrganizationVoipEntity } from 'src/crm/entity/organization-voip.entity';
import { MutationContactDto, MutationEmailDto, MutationPhoneDto, QueryContactDto } from '../dto';
import { ContactEntity } from '../entity';
import { ContactService } from '../services';
import { PrismaFilter } from 'src/helpers';

@Controller('crm/contact')
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Post()
	async create(@Body() createDto: MutationContactDto): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.create({ createDto });
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number | string): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.findById(id);
	}

	@Get('/test/:query')
	async test(@Param('query') query: string): Promise<{ data: ContactEntity[]; total: number }> {
		await delay(process.env.DELAY);
		return await this.contactService.findMany({ where: {}, search: query });
	}

	@Post('/findOnce')
	@HttpCode(200)
	async findOnce(
		@Body('where') where: QueryContactDto,
		@Body('filter') filter?: PrismaFilter<Omit<ContactEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>
	): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.findOnce({ where, filter, include });
	}

	@Post('/findMany')
	@HttpCode(200)
	async findMany(
		@Body('where') where: QueryContactDto,
		@Body('filter') filter?: PrismaFilter<Omit<ContactEntity, 'user'>>,
		@Body('include') include?: Record<string, boolean>,
		@Body('search') search?: string,
		@Body('power') power?: { medium: number; low: number; empty: number }
	): Promise<{ data: ContactEntity[]; total: number }> {
		await delay(process.env.DELAY);
		return await this.contactService.findMany({ where, filter, include, search, power });
	}

	@Get('/getVoip')
	async getVoip(): Promise<Record<string, OrganizationVoipEntity>> {
		return await this.contactService.getVoip();
	}

	@Patch('/byId/:id')
	async updateById(
		@Param('id') id: number | string,
		@Body('updateDto') updateDto: Partial<MutationContactDto>,
		@Body('phonesDto') phonesDto: MutationPhoneDto[],
		@Body('emailsDto') emailsDto: MutationEmailDto[]
	): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.updateById({ id, updateDto, phonesDto, emailsDto });
	}

	@Patch('/updateAt')
	async updateAt(@Body('id') id: number | string): Promise<void> {
		await delay(process.env.DELAY);
		return await this.contactService.updateAt({ id });
	}

	@Patch('/connectOrganizations')
	async connectOrganizations(
		@Body('contactId') contactId: number | string,
		@Body('organizationIds') organizationIds: number[] | string[]
	): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.connectOrganizations({ contactId, organizationIds });
	}

	@Patch('/searchIndexById/:id')
	async searchIndexById(@Body('id') id: number | string): Promise<void> {
		await delay(process.env.DELAY);
		return await this.contactService.searchIndexById(id);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number | string): Promise<ContactEntity> {
		await delay(process.env.DELAY);
		return await this.contactService.deleteById(id);
	}

	@Get('/elastic/byPhone/:phone')
	@Access('user')
	@UseGuards(AccessGuard)
	async elasticGetByPhone(@Param('phone') phone: number | string) {
		return await this.contactService.searchElasticByPhone({ request: phone });
	}
}
