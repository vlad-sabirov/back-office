import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { PrismaFilter } from '../../helpers';
import { PrismaService } from '../../common';
import { MutationPhoneDto, QueryPhoneDto } from '../dto';
import { PhoneEntity } from '../entity';
import { PhoneParser } from '../utils';
import { PhoneConstants } from '../constants';
import { filterByArray } from '@dsbasko/filter-by-array';
import {OrganizationService} from "./organization.service";
import {ContactService} from "./contact.service";

@Injectable()
export class PhoneService extends PrismaService {
	constructor(
		@Inject(forwardRef(() => ContactService))
		private readonly contactService: ContactService,

		@Inject(forwardRef(() => OrganizationService))
		private readonly organizationService: OrganizationService
	) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationPhoneDto }): Promise<PhoneEntity> => {
		const data = await PhoneParser.create(createDto);
		await this.throwDuplicateError({ value: data.value });
		const createdPhone = await this.crmPhone.create({ data });
		await this.searchIndexPhone({
			contactId: createdPhone.contactId,
			organizationId: createdPhone.organizationId
		});
		return createdPhone;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<PhoneEntity> => {
		return await this.crmPhone.findUnique({ where: { id: Number(id) }, include });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryPhoneDto;
		filter?: PrismaFilter<Omit<PhoneEntity, 'user' | 'organization' | 'contact'>>;
		include?: Record<string, boolean>;
	}): Promise<PhoneEntity> => {
		const parsedWhere = await PhoneParser.query(where);
		return await this.crmPhone.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryPhoneDto;
		filter?: PrismaFilter<Omit<PhoneEntity, 'user' | 'organization' | 'contact'>>;
		include?: Record<string, boolean>;
	}): Promise<PhoneEntity[]> => {
		const parsedWhere = await PhoneParser.query(where);
		return await this.crmPhone.findMany({ where: parsedWhere, include, ...filter });
	};

	findDuplicateMany = async (phones: string[]) => {
		const foundPhones = await this.crmPhone.findMany({
			where: { OR: phones.map((phoneItem) => ({ value: phoneItem })) },
		});
		if (foundPhones.length) throw new HttpException(PhoneConstants.DUPLICATE_MANY, HttpStatus.BAD_REQUEST);
	};

	update = async ({
		type, targetId, dto
	}: {
		type: string;
		targetId: number | string;
		dto: MutationPhoneDto[];
	}): Promise<PhoneEntity[]> => {
		const foundPhones = await this.crmPhone.findMany({
			where: {
				type,
				organizationId: type === 'organization' ? Number(targetId) : undefined,
				contactId: type === 'contact' ? Number(targetId) : undefined,
			},
		});

		// Добавляем телефоны
		const toAdd = filterByArray(
			dto,
			foundPhones, 
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

			await this.searchIndexPhone({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}

		// Удаляем телефоны
		const toDelete = filterByArray(
			foundPhones, 
			dto, 
			(one, two) => one.value !== two.value
		);
		for (const item of toDelete) {
			await this.throwIdNotFoundError(item.id);
			await this.deleteById(item.id);

			await this.searchIndexPhone({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}

		// Редактируем телефоны
		const toEdit = filterByArray(
			dto, 
			foundPhones, 
			(first, second) => first.value === second.value && first.comment !== second.comment
		);
		for (const item of toEdit) {
			if (!item.value) { continue; }
			const id = foundPhones.find((phoneItem) => phoneItem.value === item.value).id;
			await this.throwDuplicateError({ value: item.value, id: { not: id } });
			await this.crmPhone.update({ where: { id }, data: { comment: item.comment } });
			await this.searchIndexPhone({
				contactId: item.contactId,
				organizationId: item.organizationId
			});
		}

		return await this.crmPhone.findMany({
			where: {
				type,
				organizationId: type === 'organization' ? Number(targetId) : undefined,
				contactId: type === 'contact' ? Number(targetId) : undefined,
			},
		});
	};

	deleteById = async (id: number | string): Promise<PhoneEntity> => {
		await this.throwIdNotFoundError(id);
		const foundPhone = await this.findById(id);
		await this.searchIndexPhone({ contactId: foundPhone.contactId, organizationId: foundPhone.organizationId });
		return await this.crmPhone.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwIdNotFoundError = async (id: number | string): Promise<void> => {
		const findItem = await this.findById(id);
		if (!findItem) throw new HttpException(PhoneConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwNotFoundError = async (where: QueryPhoneDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(PhoneConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: QueryPhoneDto): Promise<void> => {
		const findDuplicate = await this.findOnce({ where });
		if (findDuplicate) throw new HttpException(PhoneConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};

	private searchIndexPhone = async (
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
