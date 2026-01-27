import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { PrismaFilter } from '../../helpers';
import { PrismaService } from '../../common';
import { MutationEmailDto, QueryEmailDto } from '../dto';
import { EmailEntity } from '../entity';
import { EmailParser } from '../utils';
import { EmailConstants } from '../constants';
import { filterByArray } from '@dsbasko/filter-by-array';
import {ContactService} from "./contact.service";
import {OrganizationService} from "./organization.service";

@Injectable()
export class EmailService extends PrismaService {
	constructor(
		@Inject(forwardRef(() => ContactService))
		private readonly contactService: ContactService,

		@Inject(forwardRef(() => OrganizationService))
		private readonly organizationService: OrganizationService
	) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationEmailDto }): Promise<EmailEntity> => {
		const data = await EmailParser.create(createDto);
		await this.throwDuplicateError({ value: data.value });
		const createdEmail = await this.crmEmail.create({ data });
		await this.searchIndexEmail({
			contactId: createdEmail.contactId,
			organizationId: createdEmail.organizationId
		});
		return createdEmail;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<EmailEntity> => {
		return await this.crmEmail.findUnique({ where: { id: Number(id) }, include });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryEmailDto;
		filter?: PrismaFilter<Omit<EmailEntity, 'user' | 'organization' | 'contact'>>;
		include?: Record<string, boolean>;
	}): Promise<EmailEntity> => {
		const parsedWhere = await EmailParser.query(where);
		return await this.crmEmail.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryEmailDto;
		filter?: PrismaFilter<Omit<EmailEntity, 'user' | 'organization' | 'contact'>>;
		include?: Record<string, boolean>;
	}): Promise<EmailEntity[]> => {
		const parsedWhere = await EmailParser.query(where);
		return await this.crmEmail.findMany({ where: parsedWhere, include, ...filter });
	};

	findDuplicateMany = async (emails: string[]) => {
		const foundEmails = await this.crmEmail.findMany({
			where: { OR: emails.map((emailItem) => ({ value: emailItem })) },
		});	
		if (foundEmails.length) throw new HttpException(EmailConstants.DUPLICATE_MANY, HttpStatus.BAD_REQUEST);
	};

	update = async ({
		type, targetId, dto
	}: {
		type: string;
		targetId: number | string;
		dto: MutationEmailDto[];
	}): Promise<EmailEntity[]> => {
		const foundEmails = await this.crmEmail.findMany({
			where: {
				type,
				organizationId: type === 'organization' ? Number(targetId) : undefined,
				contactId: type === 'contact' ? Number(targetId) : undefined,
			},
		});

		// Добавляем почтовые ящики
		const toAdd = filterByArray(
			dto,
			foundEmails, 
			(one, two) => one.value !== two.value
		);
		for (const item of toAdd) {
			if (!item.value) { continue; }
			await this.throwDuplicateError({ value: item.value });
			await this.create({ createDto: {
				value: item.value,
				comment: item.comment,
				type,
				organizationId: type === 'organization' ? Number(targetId) : undefined,
				contactId: type === 'contact' ? Number(targetId) : undefined,
			} });

			await this.searchIndexEmail({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}

		// Удаляем почтовые ящики
		const toDelete = filterByArray(
			foundEmails, 
			dto, 
			(one, two) => one.value !== two.value
		);
		for (const item of toDelete) {
			await this.throwIdNotFoundError(item.id);
			await this.deleteById(item.id);

			await this.searchIndexEmail({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}
		
		// Редактируем почтовые ящики
		const toEdit = filterByArray(
			dto, 
			foundEmails, 
			(first, second) => first.value === second.value && first.comment !== second.comment
		);
		for (const item of toEdit) {
			if (!item.value) { continue; }
			const id = foundEmails.find((emailItem) => emailItem.value === item.value).id;
			await this.throwDuplicateError({ value: item.value, id: { not: id } });
			await this.crmEmail.update({ where: { id }, data: { comment: item.comment } });

			await this.searchIndexEmail({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}

		return await this.crmEmail.findMany({
			where: {
				type,
				organizationId: type === 'organization' ? Number(targetId) : undefined,
				contactId: type === 'contact' ? Number(targetId) : undefined,
			},
		});
	};

	deleteById = async (id: number | string): Promise<EmailEntity> => {
		await this.throwIdNotFoundError(id);
		const foundEmail = await this.findById(id);
		await this.searchIndexEmail({ contactId: foundEmail.contactId, organizationId: foundEmail.organizationId });
		return await this.crmEmail.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwIdNotFoundError = async (id: number | string): Promise<void> => {
		const findItem = await this.findById(id);
		if (!findItem) throw new HttpException(EmailConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwNotFoundError = async (where: QueryEmailDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(EmailConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: QueryEmailDto): Promise<void> => {
		const findDuplicate = await this.findOnce({ where });
		if (findDuplicate) throw new HttpException(EmailConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};

	private searchIndexEmail = async (
		{ contactId, organizationId }:
			{ contactId?: string | number; organizationId?: string | number }
	): Promise<void> => {
		if (contactId) {
			await this.contactService.searchIndexById(contactId);
		} else if (organizationId) {
			await this.organizationService.searchIndexById(organizationId);
		}
	}
}
