import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { addHours, addYears, format, formatISO, parseISO } from 'date-fns';
import * as process from 'process';
import { catchError, firstValueFrom } from 'rxjs';
import { IFeedDTO } from 'src/crm/dto/feed.dto';
import { IVoipCallRecordingEntity } from 'src/crm/entity/voip.call-recording.entity';
import { PrismaFilter } from '../../helpers';
import { PrismaService } from '../../common';
import { MutationHistoryDto, QueryHistoryDto } from '../dto';
import { HistoryEntity } from '../entity';
import { HistoryParser } from '../utils';
import { HistoryConstants } from '../constants';
import { OrganizationService } from './organization.service';
import { ContactService } from './contact.service';

@Injectable()
export class HistoryService extends PrismaService {
	constructor(
		private readonly organizationService: OrganizationService,
		private readonly contactService: ContactService,
		private readonly httpService: HttpService
	) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationHistoryDto }): Promise<HistoryEntity> => {
		const data = await HistoryParser.create(createDto);
		return this.crmHistory.create({ data });
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<HistoryEntity> => {
		return this.crmHistory.findUnique({ where: { id: Number(id) }, include });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryHistoryDto;
		filter?: PrismaFilter<Omit<HistoryEntity, 'user' | 'organization' | 'contact' | 'comment'>>;
		include?: Record<string, boolean>;
	}): Promise<HistoryEntity> => {
		const parsedWhere = await HistoryParser.query(where);
		return this.crmHistory.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryHistoryDto;
		filter?: PrismaFilter<Omit<HistoryEntity, 'user' | 'organization' | 'contact' | 'comment'>>;
		include?: Record<string, boolean>;
	}): Promise<HistoryEntity[]> => {
		const parsedWhere = await HistoryParser.query(where);
		return this.crmHistory.findMany({ where: parsedWhere, include, ...filter });
	};

	getByOrganizationId = async (id: number | string): Promise<HistoryEntity[]> => {
		const organization = await this.organizationService.findOnce({
			where: { id: Number(id) },
			include: { contacts: true },
		});

		return this.crmHistory.findMany({
			where: {
				OR: [
					{ organizationId: organization.id },
					...organization.contacts.map((contact) => ({ contactId: contact.id })),
				],
			},
			include: { organization: true, user: true, contact: true },
			orderBy: { createdAt: 'desc' },
			take: 2,
		});
	};

	getByContactId = async (id: number | string): Promise<HistoryEntity[]> => {
		const contact = await this.contactService.findOnce({
			where: { id: Number(id) },
			include: { organizations: true },
		});

		return this.crmHistory.findMany({
			where: {
				OR: [
					{ contactId: contact.id },
					...contact.organizations.map((organization) => ({ organizationId: organization.id })),
				],
			},
			include: { organization: true, user: true, contact: true },
			orderBy: { createdAt: 'desc' },
			take: 3,
		});
	};

	feed = async (dto: IFeedDTO): Promise<HistoryEntity[]> => {
		const date: Date = dto.date ? parseISO(dto.date) : new Date();
		const organizations = dto.organizationID
			? await this.crmOrganization.findMany({
					where: { id: { in: dto.organizationID.map((id) => Number(id)) } },
					include: { contacts: { include: { phones: true } }, phones: true },
			  })
			: null;

		const contacts = dto.contactID
			? await this.crmContact.findMany({
					where: { id: { in: dto.contactID.map((id) => Number(id)) } },
					include: { organizations: { include: { phones: true } }, phones: true },
			  })
			: null;
		const phones: string[] = [];
		const result: HistoryEntity[] = [];

		const or: any = [];
		if (organizations && organizations.length) {
			organizations.forEach((organization) => {
				or.push({ organizationId: organization.id });
				if (organization?.contacts?.length > 0) {
					organization.contacts.forEach((contact) => {
						or.push({ contactId: contact.id });
						if (contact.phones?.length) {
							phones.push(...contact.phones.map(({ value }) => value));
						}
					});
				}
				if (organization?.phones) {
					phones.push(...organization.phones.map(({ value }) => value));
				}
			});
		}

		if (contacts && contacts.length) {
			contacts.forEach((contact) => {
				or.push({ contactId: contact.id });
				if (contact?.organizations?.length > 0) {
					contact.organizations.forEach((organization) => {
						or.push({ organizationId: organization.id });
						if (organization.phones?.length) {
							phones.push(...organization.phones.map(({ value }) => value));
						}
					});
					// or.push(...contact.organizations.map((organization) => ({ organizationId: organization.id })));
				}
				if (contact?.phones) {
					phones.push(...contact.phones.map(({ value }) => value));
				}
			});
		}

		const history = await this.crmHistory.findMany({
			where: { OR: or, createdAt: { lte: date } },
			include: { organization: true, user: true, contact: true },
			orderBy: { createdAt: 'desc' },
			take: dto.take,
		});

		result.push(...history);

		if (phones.length) {
			const dateStart = history?.[history.length - 1]?.createdAt
				? formatISO(addHours(history[history.length - 1].createdAt, 5))
				: formatISO(addYears(new Date(), 5));
			const dateEnd = formatISO(addHours(date, 5));
			const phonesHistory = await this.getCallRecordings(dateStart, dateEnd, phones);
			result.push(...phonesHistory);
		}

		result.sort((a, b) => {
			return Number(format(b.createdAt, 't')) - Number(format(a.createdAt, 't'));
		});

		return result;
	};

	getCallRecordings = async (dateStart: string, dateEnd: string, phones: string[]): Promise<HistoryEntity[]> => {
		const history: HistoryEntity[] = [];

		const { data } = await firstValueFrom(
			this.httpService
				.post<IVoipCallRecordingEntity[]>(`http://${process.env.VOIP_CONTAINER_NAME}:3000/analytics/recording`, {
					date_start: dateStart,
					date_end: dateEnd,
					phones: phones,
				})
				.pipe(
					catchError((error: AxiosError) => {
						throw `An error happened! ${error.response.data}`;
					})
				)
		);

		data.forEach((call, i) => {
			history.push({
				id: Math.ceil(Math.random() * 1000000),
				type: 'call',
				payload: call,
				isSystem: false,
				createdAt: parseISO(call.timestamp),
			});
		});

		return history;
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationHistoryDto>;
	}): Promise<HistoryEntity> => {
		const data = await HistoryParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });
		return this.crmHistory.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<HistoryEntity> => {
		await this.throwIdNotFoundError(id);
		return this.crmHistory.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwIdNotFoundError = async (id: number | string): Promise<void> => {
		const findItem = await this.findById(id);
		if (!findItem) throw new HttpException(HistoryConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwNotFoundError = async (where: QueryHistoryDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(HistoryConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};
}
