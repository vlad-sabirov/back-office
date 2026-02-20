import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { subDays } from 'date-fns';
import { OrganizationVoipEntity } from 'src/crm/entity/organization-voip.entity';
import { SearchService } from 'src/search/search.service';
import { PrismaFilter } from 'src/helpers';
import { delay, PrismaService } from 'src/common';
import { IOrganizationInnEntity, OrganizationEntity } from '../entity';
import { OrganizationParser } from '../utils';
import { OrganizationConstants } from '../constants';
import { MutationEmailDto, MutationOrganizationDto, MutationPhoneDto, QueryOrganizationDto } from '../dto';
import { ICrmOrganizationSearchEntity } from '../search-types/organization-search.entity';
import { PhoneService } from './phone.service';
import { EmailService } from './email.service';
import {OrganizationRequisiteService} from "./organization-requisite.service";

@Injectable()
export class OrganizationService extends PrismaService implements OnModuleInit {
	private logger: Logger = new Logger('CrmOrganizationService');

	constructor(
		private readonly searchService: SearchService,

		@Inject(forwardRef(() => PhoneService))
		private readonly phoneService: PhoneService,

		@Inject(forwardRef(() => OrganizationRequisiteService))
		private readonly requisiteService: OrganizationRequisiteService,

		@Inject(forwardRef(() => EmailService))
		private readonly emailService: EmailService
	) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationOrganizationDto }): Promise<OrganizationEntity> => {
		const data = await OrganizationParser.create(createDto);
		await this.throwDuplicateError({
			OR: [{ nameRu: data.nameRu }, { nameEn: data.nameEn }, { firstDocument: data.firstDocument }],
		});
		const createdOrganization = await this.crmOrganization.create({ data });
		await this.searchIndexById(createdOrganization.id);
		return createdOrganization;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<OrganizationEntity> => {
		return this.crmOrganization.findUnique({ where: { id: Number(id) }, include });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationDto;
		filter?: PrismaFilter<
			Omit<
				OrganizationEntity,
				'user' | 'type' | 'tags' | 'requisites' | 'contacts' | 'phones' | 'emails' | 'comments' | 'history'
			>
		>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationEntity> => {
		const { tags, ...whereWithoutSpecial } = where;
		const parsedWhere: any = await OrganizationParser.query(whereWithoutSpecial);
		if (tags && tags.length > 0) parsedWhere.tags = { some: { id: { in: tags.map((tag) => Number(tag)) } } };
		return this.crmOrganization.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
		search,
		power,
	}: {
		where: QueryOrganizationDto;
		filter?: PrismaFilter<
			Omit<
				OrganizationEntity,
				'user' | 'type' | 'tags' | 'requisites' | 'contacts' | 'phones' | 'emails' | 'comments' | 'history'
			>
		>;
		include?: Record<string, boolean>;
		search?: string;
		power?: { medium: number; low: number; empty: number };
	}): Promise<{
		data: OrganizationEntity[];
		total: number;
		full?: number;
		medium?: number;
		low?: number;
		empty?: number;
		all?: number;
	}> => {
		const { tags, ...whereWithoutSpecial } = where;
		let parsedWhere: any = await OrganizationParser.query(whereWithoutSpecial);
		if (tags && tags.length > 0) parsedWhere.tags = { some: { id: { in: tags.map((tag) => Number(tag)) } } };

		if (search?.trim()) {
			const elasticResult = await this.searchElastic({ request: search, deep: true });
			const elasticIds = elasticResult.hits.hits.map((item) => Number(item._id));
			parsedWhere = {
				...parsedWhere,
				id: { in: elasticIds },
			};
		}

		const mediumDate = power?.medium ? subDays(new Date(), power.medium) : undefined;
		const lowDate = power?.medium ? subDays(new Date(), power.low) : undefined;
		const emptyDate = power?.medium ? subDays(new Date(), power.empty) : undefined;

		return {
			data: await this.crmOrganization.findMany({ where: parsedWhere, include, ...filter }),
			total: await this.crmOrganization.count({ where: parsedWhere }),
			all: await this.crmOrganization.count({ where: { isArchive: false, isVerified: true } }),

			full: power?.medium
				? await this.crmOrganization.count({
						where: {
							...{ ...parsedWhere, last1CUpdate: undefined },
							AND: [{ last1CUpdate: { gt: mediumDate } }, { last1CUpdate: { lte: new Date() } }],
							NOT: [{ userId: 0 }, { userId: 1 }],
						},
					})
				: undefined,

			medium:
				power?.low && power?.medium
					? await this.crmOrganization.count({
							where: {
								...{ ...parsedWhere, last1CUpdate: undefined },
								AND: [{ last1CUpdate: { gt: lowDate } }, { last1CUpdate: { lte: mediumDate } }],
								NOT: [{ userId: 0 }, { userId: 1 }],
							},
						})
					: undefined,

			low:
				power?.low && power?.empty
					? await this.crmOrganization.count({
							where: {
								...{ ...parsedWhere, last1CUpdate: undefined },
								AND: [{ last1CUpdate: { gt: emptyDate } }, { last1CUpdate: { lte: lowDate } }],
								NOT: [{ userId: 0 }, { userId: 1 }],
							},
						})
					: undefined,

			empty: power?.empty
				? await this.crmOrganization.count({
						where: {
							...{ ...parsedWhere, last1CUpdate: undefined },
							OR: [{ last1CUpdate: { lt: emptyDate } }, { last1CUpdate: null }],
							NOT: [{ userId: 0 }, { userId: 1 }],
						},
					})
				: undefined,
		};
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
		return await this.searchService.search<ICrmOrganizationSearchEntity>({
			index: 'crm_organization',
			body: {
				nameRu: { type: 'string', value: request },
				nameEn: { type: 'string', value: request },
				phones: { type: 'keyword', value: requestToNumber.slice(-9) },
				emails: { type: 'keyword', value: request },
				website: { type: 'keyword', value: request },
				requisiteName: { type: 'string', value: request },
				requisiteInn: { type: 'keyword', value: requestToNumber },
				contactsName: deep ? { type: 'string', value: request } : undefined,
				// contactsPhones: deep ? { type: 'keyword', value: requestToNumber.slice(-9) } : undefined,
				// contactsEmails: deep ? { type: 'keyword', value: request } : undefined,
				contactsPhones: undefined,
				contactsEmails: undefined,
			},
			filter: [
				{
					bool: {
						must: [{ script: { script: 'doc["requisiteInn"].length == 0' } }, { term: { userId: 0 } }],
					},
				},
			],
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
		return await this.searchService.search<ICrmOrganizationSearchEntity>({
			index: 'crm_organization',
			body: {
				phones: { type: 'keyword', value: requestToNumber.slice(-9) },
			},
			take,
			skip,
		});
	};

	findInnWithUser = async (): Promise<IOrganizationInnEntity[]> => {
		const foundOrgs = await this.crmOrganization.findMany({
			where: { userId: { not: null } },
			include: { requisites: true },
		});
		return foundOrgs.map((organization) => ({
			organizationId: organization.id,
			inn: organization.requisites.map((requisite) => requisite.inn),
		}));
	};

	getVoip = async (): Promise<Record<string, OrganizationVoipEntity>> => {
		const result: Record<string, OrganizationVoipEntity> = {};

		const allOrgs = await this.crmOrganization.findMany({ where: { isArchive: false }, include: { phones: true } });
		allOrgs.forEach((org) => {
			org.phones.forEach((phone) => {
				result[phone.value] = {
					id: org.id,
					name: `${org.nameEn} (${org.nameRu})`,
					phone: org.phones.map((phone) => phone.value),
				};
			});
		});

		return result;
	};

	getCountOrganizationsWithUserIds = async (userIds: number[]): Promise<number> => {
		const result = await this.crmOrganization.count({ where: { OR: userIds.map((userId) => ({ userId })) } });
		return result ?? 0;
	};

	getCountUnverified = async (): Promise<number> => {
		return this.crmOrganization.count({ where: { isVerified: false } });
	};

	updateById = async ({
		id,
		updateDto,
		phonesDto,
		emailsDto,
		tagsDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationOrganizationDto>;
		phonesDto?: MutationPhoneDto[];
		emailsDto?: MutationEmailDto[];
		tagsDto?: (number | string)[];
	}): Promise<OrganizationEntity> => {
		const data = await OrganizationParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });
		await this.throwDuplicateError({
			OR: [{ nameRu: data.nameRu }, { nameEn: data.nameEn }, { firstDocument: data.firstDocument }],
			NOT: { id: Number(id) },
		});

		if (phonesDto) {
			await this.phoneService.update({
				type: 'organization',
				targetId: Number(id),
				dto: phonesDto,
			});
		}

		if (emailsDto) {
			await this.emailService.update({
				type: 'organization',
				targetId: Number(id),
				dto: emailsDto,
			});
		}

		if (tagsDto) {
			await this.connectTags({ organizationId: id, tagIds: tagsDto });
		}

		const updatedOrganization = await this.crmOrganization.update({ where: { id: Number(id) }, data });
		await this.updateAt({ id: updatedOrganization.id });
		await this.searchIndexById(updatedOrganization.id);
		return updatedOrganization;
	};

	updateAt = async ({ id }: { id: number | string }): Promise<void> => {
		const updatedAt = new Date();
		const foundOrganization = await this.findOnce({ where: { id }, include: { contacts: true } });

		await this.crmOrganization.update({ where: { id: foundOrganization.id }, data: { updatedAt } });

		if (foundOrganization.contacts.length) {
			await this.crmContact.updateMany({
				where: { id: { in: foundOrganization.contacts.map(({ id }) => id) } },
				data: { updatedAt },
			});
		}
	};

	deleteById = async (id: number | string): Promise<OrganizationEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		await this.crmPhone.deleteMany({ where: { organizationId: Number(id) } });
		await this.crmEmail.deleteMany({ where: { organizationId: Number(id) } });
		await this.crmOrganizationRequisite.deleteMany({ where: { organizationId: Number(id) } });
		await this.searchDeleteById(id);
		return this.crmOrganization.delete({ where: { id: Number(id) } });
	};

	toArchiveById = async (id: number | string): Promise<OrganizationEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		const result = await this.crmOrganization.update({
			where: { id: Number(id) },
			data: { isArchive: true, userId: null },
		});
		// await this.requisiteService.deleteByOrganizationId(id);
		await this.connectContacts({ organizationId: id, contactIds: [] });
		await this.updateAt({ id });
		await this.searchIndexById(id);
		return result;
	};

	fromArchiveById = async (id: number | string): Promise<OrganizationEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		const result = await this.crmOrganization.update({ where: { id: Number(id) }, data: { isArchive: false } });
		await this.updateAt({ id });
		await this.searchIndexById(id);
		return result;
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	connectContacts = async ({
		organizationId,
		contactIds,
	}: {
		organizationId: number | string;
		contactIds: (number | string)[];
	}) => {
		await this.throwNotFoundError({ id: Number(organizationId) });
		return this.crmOrganization.update({
			where: { id: Number(organizationId) },
			data: { contacts: { set: contactIds.map((id) => ({ id: Number(id) })) } },
		});
	};

	connectTags = async ({
		organizationId,
		tagIds,
	}: {
		organizationId: number | string;
		tagIds: (number | string)[];
	}) => {
		await this.throwNotFoundError({ id: Number(organizationId) });
		return this.crmOrganization.update({
			where: { id: Number(organizationId) },
			data: { tags: { set: tagIds.map((id) => ({ id: Number(id) })) } },
		});
	};

	private throwNotFoundError = async (where: QueryOrganizationDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(OrganizationConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: QueryOrganizationDto): Promise<void> => {
		const findDuplicate = await this.findOnce({ where });
		if (findDuplicate) throw new HttpException(OrganizationConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};

	public searchIndexById = async (id: number | string): Promise<void> => {
		const foundOrganization = await this.findOnce({
			where: { id },
			include: { contacts: true, phones: true, requisites: true, emails: true, user: true },
		});
		await this.searchService.index<ICrmOrganizationSearchEntity>({
			index: 'crm_organization',
			id: String(foundOrganization.id),
			body: {
				nameRu: foundOrganization.nameRu ? foundOrganization.nameRu.toLowerCase() : '',
				nameEn: foundOrganization.nameEn ? foundOrganization.nameEn.toLowerCase() : '',
				phones: foundOrganization.phones.map(({ value }) => value.toLowerCase()),
				emails: foundOrganization.emails.map(({ value }) => value.toLowerCase()),
				website: foundOrganization.website.toLowerCase(),
				requisiteName: foundOrganization.requisites.map(({ name }) => name.toLowerCase()),
				requisiteInn: foundOrganization.requisites.map(({ inn }) => String(inn)),
				contactsName: foundOrganization.contacts.map(({ name }) => name.toLowerCase()),
				// contactsPhones: foundOrganization.phones.map((phones) => phones.value.toLowerCase()).flat(),
				// contactsEmails: foundOrganization.emails.map((emails) => emails.value.toLowerCase()).flat(),
				contactsPhones: [],
				contactsEmails: [],
				isArchive: Number(foundOrganization.isArchive),
				isReserve: Number(foundOrganization.isReserve),
				isVerified: Number(foundOrganization.isVerified),
				userId: Number(foundOrganization.userId) || 0,
			},
		});
	};

	private searchDeleteById = async (id: number | string): Promise<void> => {
		await this.searchService.deleteIndex({ index: 'crm_organization', id: String(id) });
	};

	private elasticSearchInit = async (): Promise<void> => {
		await delay(process.env.NODE_ENV === 'development' ? 0 : 60000);
		try {
			await this.searchService.ping();
		} catch (e) {
			setTimeout(() => this.onModuleInit(), 1000);
			return;
		}

		performance.mark('elasticSearchCrmOrganizationInitStart');
		this.logger.log('Start elastic search init');

		try {
			await this.searchService.delete('crm_organization');
		} catch (e) {}

		try {
			await this.searchService.init<ICrmOrganizationSearchEntity>({
				index: 'crm_organization',
				fields: {
					nameRu: 'string',
					nameEn: 'string',
					phones: 'keyword',
					emails: 'keyword',
					website: 'keyword',
					requisiteName: 'string',
					requisiteInn: 'keyword',
					contactsName: 'string',
					contactsPhones: 'keyword',
					contactsEmails: 'keyword',
					isArchive: 'number',
					isReserve: 'number',
					isVerified: 'number',
					userId: 'number',
				},
			});
		} catch (e) {}

		try {
			const organizations = await this.crmOrganization.findMany({
				where: {},
				include: {
					phones: true,
					emails: true,
					requisites: true,
					contacts: { include: { phones: true, emails: true } },
					user: true,
				},
			});
			for (const organization of organizations) {
				await this.searchService.index<ICrmOrganizationSearchEntity>({
					index: 'crm_organization',
					id: String(organization.id),
					body: {
						nameRu: organization.nameRu ? organization.nameRu.toLowerCase() : '',
						nameEn: organization.nameEn ? organization.nameEn.toLowerCase() : '',
						phones: organization.phones.map(({ value }) => value.toLowerCase()),
						emails: organization.emails.map(({ value }) => value.toLowerCase()),
						website: organization.website.toLowerCase(),
						requisiteName: organization.requisites.map(({ name }) => name.toLowerCase()),
						requisiteInn: organization.requisites.map(({ inn }) => String(inn)),
						contactsName: organization.contacts.map(({ name }) => name.toLowerCase()),
						// contactsPhones: organization.contacts
						// 	.map(({ phones }) => phones.map(({ value }) => value.toLowerCase()))
						// 	.flat(),
						// contactsEmails: organization.contacts
						// 	.map(({ emails }) => emails.map(({ value }) => value.toLowerCase()))
						// 	.flat(),
						contactsPhones: [],
						contactsEmails: [],
						isArchive: Number(organization.isArchive),
						isReserve: Number(organization.isReserve),
						isVerified: Number(organization.isVerified),
						userId: organization.userId || 0,
					},
				});
			}
		} catch (e) {
			throw e;
		}

		performance.mark('elasticSearchCrmOrganizationInitFinish');
		performance.measure(
			'elasticSearchCrmOrganizationInit',
			'elasticSearchCrmOrganizationInitStart',
			'elasticSearchCrmOrganizationInitFinish'
		);
		const measure = performance.getEntriesByName('elasticSearchCrmOrganizationInit')[0];
		this.logger.log(`Elastic search init complete ${Math.round(measure.duration)}ms`);
	};

	onModuleInit = async () => {
		this.elasticSearchInit().then();
	};

	/**
	 * Организации, которые скоро сменят Power статус (для виджета CRM)
	 */
	getUpcomingTransitions = async (userId: number, days: number = 3): Promise<{
		id: number;
		nameRu: string;
		nameEn: string;
		currentStatus: string;
		nextStatus: string;
		daysLeft: number;
		last1CUpdate: Date | null;
	}[]> => {
		const now = new Date();
		const thresholds = [
			{ threshold: 30, from: 'full', to: 'medium' },
			{ threshold: 60, from: 'medium', to: 'low' },
			{ threshold: 90, from: 'low', to: 'empty' },
		];

		const results: any[] = [];

		for (const { threshold, from, to } of thresholds) {
			// Окно: от (threshold - days) до threshold дней назад
			const windowStart = subDays(now, threshold);
			const windowEnd = subDays(now, threshold - days);

			const orgs = await this.crmOrganization.findMany({
				where: {
					userId,
					last1CUpdate: {
						gt: windowStart,
						lte: windowEnd,
					},
				},
				select: { id: true, nameRu: true, nameEn: true, last1CUpdate: true },
			});

			for (const org of orgs) {
				const daysSinceUpdate = org.last1CUpdate
					? Math.floor((now.getTime() - new Date(org.last1CUpdate).getTime()) / (1000 * 60 * 60 * 24))
					: threshold;
				results.push({
					id: org.id,
					nameRu: org.nameRu || '',
					nameEn: org.nameEn || '',
					currentStatus: from,
					nextStatus: to,
					daysLeft: threshold - daysSinceUpdate,
					last1CUpdate: org.last1CUpdate,
				});
			}
		}

		return results.sort((a, b) => a.daysLeft - b.daysLeft);
	};

	/**
	 * Статистика Power по сотрудникам (для виджета crmAdmin)
	 */
	getPowerByStaff = async (): Promise<{
		userId: number;
		firstName: string;
		lastName: string;
		full: number;
		medium: number;
		low: number;
		empty: number;
		total: number;
	}[]> => {
		const now = new Date();
		const mediumDate = subDays(now, 30);
		const lowDate = subDays(now, 60);
		const emptyDate = subDays(now, 90);

		// Найти всех пользователей с организациями
		const users = await this.user.findMany({
			where: {
				roles: { some: { alias: 'crm' } },
			},
			select: { id: true, firstName: true, lastName: true },
		});

		const results: any[] = [];

		for (const user of users) {
			const baseWhere = { userId: user.id, NOT: [{ userId: 0 }, { userId: 1 }] };

			const [full, medium, low, empty, total] = await Promise.all([
				this.crmOrganization.count({
					where: { ...baseWhere, last1CUpdate: { gt: mediumDate } },
				}),
				this.crmOrganization.count({
					where: { ...baseWhere, last1CUpdate: { lte: mediumDate, gt: lowDate } },
				}),
				this.crmOrganization.count({
					where: { ...baseWhere, last1CUpdate: { lte: lowDate, gt: emptyDate } },
				}),
				this.crmOrganization.count({
					where: {
						...baseWhere,
						OR: [{ last1CUpdate: { lte: emptyDate } }, { last1CUpdate: null }],
					},
				}),
				this.crmOrganization.count({ where: { userId: user.id } }),
			]);

			if (total > 0) {
				results.push({
					userId: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					full,
					medium,
					low,
					empty,
					total,
				});
			}
		}

		return results;
	};

	deleteMe = async (): Promise<string> => {
		const organizations = await this.crmOrganization.findMany();
		const response: { name: string; inn: number }[] = [];

		for (const org of organizations) {
			const requisite = await this.requisiteService.findOnce({
				where: { organizationId: org.id }
			});

			if (requisite === null) {
				continue;
			}

			response.push({ name: requisite.name, inn: requisite.inn });
		}

		const csvHeader = 'name,inn';
		const csvRows = response.map(item => `${item.name},${item.inn}`);
		const csv = [csvHeader, ...csvRows].join('\n');

		return csv;
	};
}
