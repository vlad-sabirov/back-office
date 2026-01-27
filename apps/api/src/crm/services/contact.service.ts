import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { sub } from 'date-fns';
import { ContactVoipEntity } from 'src/crm/entity/contact-voip.entity';
import { OrganizationVoipEntity } from 'src/crm/entity/organization-voip.entity';
import { PrismaFilter } from 'src/helpers';
import { delay, PrismaService } from 'src/common';
import { MutationContactDto, MutationEmailDto, MutationPhoneDto, QueryContactDto } from '../dto';
import { ContactEntity } from '../entity';
import { ContactParser } from '../utils';
import { ContactConstants } from '../constants';
import { SearchService } from 'src/search/search.service';
import { ICrmContactSearchEntity } from '../search-types/contact-search.entity';
import { PhoneService } from './phone.service';
import { EmailService } from './email.service';

@Injectable()
export class ContactService extends PrismaService {
	private logger: Logger = new Logger('CrmContactService');

	constructor(
		private readonly searchService: SearchService,

		@Inject(forwardRef(() => PhoneService))
		private readonly phoneService: PhoneService,

		@Inject(forwardRef(() => EmailService))
		private readonly emailService: EmailService
	) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationContactDto }): Promise<ContactEntity> => {
		const data = await ContactParser.create(createDto);
		const createdContact = await this.crmContact.create({ data });
		await this.searchIndexById(createdContact.id);
		return createdContact;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<ContactEntity> => {
		return await this.crmContact.findUnique({ where: { id: Number(id) }, include });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryContactDto;
		filter?: PrismaFilter<
			Omit<ContactEntity, 'user' | 'organizations' | 'phones' | 'emails' | 'comments' | 'history'>
		>;
		include?: Record<string, boolean>;
	}): Promise<ContactEntity> => {
		const parsedWhere = await ContactParser.query(where);
		return await this.crmContact.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
		search,
		power,
	}: {
		where: QueryContactDto;
		filter?: PrismaFilter<
			Omit<ContactEntity, 'user' | 'organizations' | 'phones' | 'emails' | 'comments' | 'history'>
		>;
		include?: Record<string, boolean>;
		search?: string;
		power?: { medium: number; low: number; empty: number };
	}): Promise<{
		data: ContactEntity[];
		total: number;
		full?: number;
		medium?: number;
		low?: number;
		empty?: number;
	}> => {
		let parsedWhere: any = await ContactParser.query(where);

		if (search?.trim()) {
			const elasticResult = await this.searchElastic({ request: search, deep: true });
			const elasticIds = elasticResult.hits.hits.map((item) => Number(item._id));
			parsedWhere = {
				...parsedWhere,
				id: { in: elasticIds },
			};
		}

		const mediumDate = power?.medium ? sub(new Date(), { days: power.medium }) : undefined;
		const lowDate = power?.medium ? sub(new Date(), { days: power.low }) : undefined;
		const emptyDate = power?.medium ? sub(new Date(), { days: power.empty }) : undefined;

		return {
			data: await this.crmContact.findMany({ where: parsedWhere, include, ...filter }),
			total: await this.crmContact.count({ where: parsedWhere }),

			full: power?.medium
				? await this.crmOrganization.count({
						where: {
							...{ ...parsedWhere, updatedAt: undefined },
							AND: [{ updatedAt: { gte: mediumDate } }, { updatedAt: { lt: new Date() } }],
						},
				  })
				: undefined,

			medium:
				power?.low && power?.medium
					? await this.crmOrganization.count({
							where: {
								...{ ...parsedWhere, updatedAt: undefined },
								AND: [{ updatedAt: { gte: lowDate } }, { updatedAt: { lt: mediumDate } }],
							},
					  })
					: undefined,

			low:
				power?.low && power?.empty
					? await this.crmOrganization.count({
							where: {
								...{ ...parsedWhere, updatedAt: undefined },
								AND: [{ updatedAt: { gte: emptyDate } }, { updatedAt: { lt: lowDate } }],
							},
					  })
					: undefined,

			empty: power?.empty
				? await this.crmOrganization.count({
						where: {
							...parsedWhere,
							updatedAt: { lt: emptyDate },
						},
				  })
				: undefined,
		};
	};

	getVoip = async (): Promise<Record<string, ContactVoipEntity>> => {
		const result: Record<string, ContactVoipEntity> = {};

		const allConts = await this.crmContact.findMany({ where: { isArchive: false }, include: { phones: true } });
		allConts.forEach((cont) => {
			cont.phones.forEach((phone) => {
				result[phone.value] = {
					id: cont.id,
					name: cont.name,
					phone: cont.phones.map((phone) => phone.value),
				};
			});
		});

		return result;
	};

	searchElastic = async ({
		request,
		deep,
		take,
		skip,
	}: {
		request: string;
		deep?: boolean;
		take?: number;
		skip?: number;
	}) => {
		const requestToNumber = request.replace(/[^0-9]/g, '');
		return await this.searchService.search<ICrmContactSearchEntity>({
			index: 'crm_contact',
			body: {
				name: { type: 'string', value: request },
				phones: { type: 'keyword', value: requestToNumber.slice(-9) },
				emails: { type: 'keyword', value: request },
				organizationsName: deep ? { type: 'string', value: request } : undefined,
				// organizationsPhones: deep ? { type: 'keyword', value: requestToNumber.slice(-9) } : undefined,
				// organizationsEmails: deep ? { type: 'keyword', value: request } : undefined,
				organizationsPhones: undefined,
				organizationsEmails: undefined,
			},
			take,
			skip,
		});
	};

	searchElasticByPhone = async ({
		request,
		take,
		skip,
	}: {
		request: string | number;
		deep?: boolean;
		take?: number;
		skip?: number;
	}) => {
		const requestToNumber = String(request).replace(/[^0-9]/g, '');
		return await this.searchService.search<ICrmContactSearchEntity>({
			index: 'crm_contact',
			body: { phones: { type: 'keyword', value: requestToNumber.slice(-9) } },
			take,
			skip,
		});
	};

	updateById = async ({
		id,
		updateDto,
		phonesDto,
		emailsDto,
	}: {
		id: number | string;
		updateDto?: Partial<MutationContactDto>;
		phonesDto?: MutationPhoneDto[];
		emailsDto?: MutationEmailDto[];
	}): Promise<ContactEntity> => {
		const data = await ContactParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });

		if (phonesDto) {
			await this.phoneService.update({
				type: 'contact',
				targetId: Number(id),
				dto: phonesDto,
			});
		}

		if (emailsDto) {
			await this.emailService.update({
				type: 'contact',
				targetId: Number(id),
				dto: emailsDto,
			});
		}

		if (!updateDto) {
			return null;
		}
		const updatedContact = await this.crmContact.update({ where: { id: Number(id) }, data });
		await this.updateAt({ id: updatedContact.id });
		await this.searchIndexById(updatedContact.id);
		return updatedContact;
	};

	updateAt = async ({ id }: { id: number | string }): Promise<void> => {
		const updatedAt = new Date();
		const foundContact = await this.findOnce({ where: { id }, include: { organizations: true } });

		await this.crmContact.update({ where: { id: foundContact.id }, data: { updatedAt } });

		if (foundContact.organizations.length) {
			await this.crmOrganization.updateMany({
				where: { id: { in: foundContact.organizations.map((org) => org.id) } },
				data: { updatedAt },
			});
		}
	};

	connectOrganizations = async ({
		contactId,
		organizationIds,
	}: {
		contactId: number | string;
		organizationIds: number[] | string[];
	}) => {
		if (!contactId) return;
		await this.throwNotFoundError({ id: Number(contactId) });
		const foundContact = await this.findOnce({ where: { id: contactId }, include: { organizations: true } });
		const newOrganizationIds = organizationIds.map((id) => Number(id));
		const oldOrganizationIds = foundContact.organizations.map((org) => org.id);
		const disconnectOrganizationIds = oldOrganizationIds.filter((id) => !newOrganizationIds.includes(id));
		const connectOrganizationIds = newOrganizationIds.filter((id) => !oldOrganizationIds.includes(id));

		// Связываем новые организации, если требуется
		if (connectOrganizationIds.length) {
			await this.crmContact.update({
				where: { id: Number(contactId) },
				data: { organizations: { connect: connectOrganizationIds.map((id) => ({ id })) } },
			});
		}

		// Отвязываем старые организации, если требуется
		if (disconnectOrganizationIds.length) {
			await this.crmContact.update({
				where: { id: Number(contactId) },
				data: { organizations: { disconnect: disconnectOrganizationIds.map((id) => ({ id })) } },
			});
		}

		// Если массив пуст, то удаляем все связи
		if (!newOrganizationIds.length) {
			await this.crmContact.update({
				where: { id: Number(contactId) },
				data: { organizations: { set: [] } },
			});
		}

		return foundContact;
	};

	deleteById = async (id: number | string): Promise<ContactEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		await this.crmPhone.deleteMany({ where: { contactId: Number(id) } });
		await this.crmEmail.deleteMany({ where: { contactId: Number(id) } });
		await this.searchDeleteById(id);
		return await this.crmContact.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwNotFoundError = async (where: QueryContactDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(ContactConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	public searchIndexById = async (id: number | string): Promise<void> => {
		const foundContact = await this.findOnce({
			where: { id },
			include: { organizations: true, phones: true, emails: true },
		});
		await this.searchService.index({
			index: 'crm_contact',
			id: String(foundContact.id),
			body: {
				name: foundContact.name.toLowerCase(),
				phones: foundContact.phones.map(({ value }) => value.toLowerCase()),
				emails: foundContact.emails.map(({ value }) => value.toLowerCase()),
				organizationsName: foundContact.organizations.map(
					({ nameRu, nameEn }) => `${nameRu ? nameRu.toLowerCase() : ''}${nameEn ? nameEn.toLowerCase() : ''}`
				),
				// organizationsPhones: foundContact?.phones.map((phones) => phones.value.toLowerCase()).flat(),
				// organizationsEmails: foundContact?.emails.map((emails) => emails.value.toLowerCase()).flat(),
				organizationsPhones: undefined,
				organizationsEmails: undefined,
				userId: foundContact.userId || 0,
			},
		});
	};

	private searchDeleteById = async (id: number | string): Promise<void> => {
		await this.searchService.deleteIndex({ index: 'crm_contact', id: String(id) });
	};

	private elasticSearchInit = async (): Promise<void> => {
		await delay(process.env.NODE_ENV === 'development' ? 0 : 60000);
		try {
			await this.searchService.ping();
		} catch (e) {
			setTimeout(() => this.onModuleInit(), 1000);
			return;
		}

		performance.mark('elasticSearchCrmContactInitStart');
		this.logger.log('Start elastic search init');

		try {
			await this.searchService.delete('crm_contact');
		} catch (e) {}

		try {
			await this.searchService.init<ICrmContactSearchEntity>({
				index: 'crm_contact',
				fields: {
					name: 'string',
					phones: 'keyword',
					emails: 'keyword',
					organizationsName: 'string',
					organizationsPhones: 'keyword',
					organizationsEmails: 'keyword',
					userId: 'number',
				},
			});
		} catch (e) {}

		try {
			const contacts = await this.crmContact.findMany({
				where: { isArchive: false },
				include: { phones: true, emails: true, organizations: { include: { phones: true, emails: true } } },
			});
			for (const contact of contacts) {
				await this.searchService.index<ICrmContactSearchEntity>({
					index: 'crm_contact',
					id: String(contact.id),
					body: {
						name: contact.name.toLowerCase(),
						phones: contact.phones.map(({ value }) => value.toLowerCase()),
						emails: contact.emails.map(({ value }) => value.toLowerCase()),
						organizationsName: contact.organizations.map(
							({ nameRu, nameEn }) =>
								`${nameRu ? nameRu.toLowerCase() : ''}${nameEn ? nameEn.toLowerCase() : ''}`
						),
						// organizationsPhones: contact.organizations
						// 	.map(({ phones }) => phones.map(({ value }) => value.toLowerCase()))
						// 	.flat(),
						// organizationsEmails: contact.organizations
						// 	.map(({ emails }) => emails.map(({ value }) => value.toLowerCase()))
						// 	.flat(),
						organizationsPhones: [],
						organizationsEmails: [],
						userId: contact.userId || 0,
					},
				});
			}
		} catch (e) {}

		performance.mark('elasticSearchCrmContactInitFinish');
		performance.measure(
			'elasticSearchCrmContactInit',
			'elasticSearchCrmContactInitStart',
			'elasticSearchCrmContactInitFinish'
		);
		const measure = performance.getEntriesByName('elasticSearchCrmContactInit')[0];
		this.logger.log(`Elastic search init complete ${Math.round(measure.duration)}ms`);
	};

	onModuleInit = async () => {
		this.elasticSearchInit().then();
	};
}
