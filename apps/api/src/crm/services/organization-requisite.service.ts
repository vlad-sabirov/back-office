import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { MutationOrganizationRequisiteDto, QueryOrganizationRequisiteDto } from '../dto';
import { OrganizationRequisiteEntity } from '../entity';
import { OrganizationRequisiteParser } from '../utils';
import { OrganizationRequisiteConstants } from '../constants';
import { PrismaFilter } from '../../helpers';
import { isArray } from 'lodash';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationRequisiteService extends PrismaService {
	constructor(
		@Inject(forwardRef(() => OrganizationService))
		private readonly organizationService: OrganizationService
	) {
		super();
	}

	create = async ({
		createDto,
	}: {
		createDto: MutationOrganizationRequisiteDto;
	}): Promise<OrganizationRequisiteEntity> => {
		const data = await OrganizationRequisiteParser.create(createDto);
		await this.throwDuplicateError({ code1c: data.code1c });
		return await this.crmOrganizationRequisite.create({ data });
	};

	findById = async (id: number | string): Promise<OrganizationRequisiteEntity> => {
		return await this.crmOrganizationRequisite.findUnique({ where: { id: Number(id) } });
	};

	findByInn = async (inn: string | number): Promise<OrganizationRequisiteEntity> => {
		return await this.crmOrganizationRequisite.findFirst({ where: { inn: Number(inn) } });
	};

	findByCode1c = async (code1c: string): Promise<OrganizationRequisiteEntity> => {
		return await this.crmOrganizationRequisite.findFirst({ where: { code1c } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationRequisiteDto;
		filter?: PrismaFilter<Omit<OrganizationRequisiteEntity, 'organization'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationRequisiteEntity> => {
		const parsedWhere = await OrganizationRequisiteParser.query(where);
		return await this.crmOrganizationRequisite.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationRequisiteDto;
		filter?: PrismaFilter<Omit<OrganizationRequisiteEntity, 'organization'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationRequisiteEntity[]> => {
		const parsedWhere = await OrganizationRequisiteParser.query(where);
		return await this.crmOrganizationRequisite.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationOrganizationRequisiteDto>;
	}): Promise<OrganizationRequisiteEntity> => {
		const data = await OrganizationRequisiteParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });
		if (data.code1c) await this.throwDuplicateError({ id: Number(id), code1c: data.code1c });
		return await this.crmOrganizationRequisite.update({ where: { id: Number(id) }, data });
	};

	updateByInn = async ({
		inn,
		updateDto,
	}: {
		inn: number | string;
		updateDto: Partial<MutationOrganizationRequisiteDto>;
	}): Promise<OrganizationRequisiteEntity> => {
		const data = await OrganizationRequisiteParser.update(updateDto);
		await this.throwNotFoundError({ inn });

		const item = await this.crmOrganizationRequisite.findFirst({
			where: { inn: Number(inn) },
		});

		if (!item) throw new Error('Not found');

		console.log(JSON.stringify(data, null, 2));

		return await this.crmOrganizationRequisite.update({
			where: { id: item.id },
			data,
		});
	};

	updateByCode1c = async ({
		code1c,
		updateDto,
	}: {
		code1c: string;
		updateDto: Partial<MutationOrganizationRequisiteDto>;
	}): Promise<OrganizationRequisiteEntity> => {
		const data = await OrganizationRequisiteParser.update(updateDto);
		await this.throwNotFoundError({ code1c });

		const item = await this.crmOrganizationRequisite.findFirst({ where: { code1c } });
		if (!item) throw new Error('Not found');

		return await this.crmOrganizationRequisite.update({
			where: { id: item.id },
			data,
		});
	};

	deleteById = async (id: number | string): Promise<OrganizationRequisiteEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		return await this.crmOrganizationRequisite.delete({ where: { id: Number(id) } });
	};

	deleteByOrganizationId = async (id: number | string): Promise<OrganizationRequisiteEntity> => {
		const organization = await this.organizationService.findOnce({
			where: { id: Number(id) },
			include: { requisites: true },
		});
		for (const requisite of organization.requisites) {
			return await this.crmOrganizationRequisite.delete({
				where: { id: Number(requisite.id) },
			});
		}
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwNotFoundError = async ({
		id,
		inn,
		code1c,
	}: {
		id?: number;
		inn?: number | string;
		code1c?: string;
	}): Promise<void> => {
		if (!!id) {
			const findItem = await this.crmOrganizationRequisite.findUnique({ where: { id } });
			if (!findItem) throw new HttpException(OrganizationRequisiteConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		if (!!inn) {
			const findItem = await this.crmOrganizationRequisite.findFirst({ where: { inn: Number(inn) } });
			if (!findItem) throw new HttpException(OrganizationRequisiteConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		if (!!code1c) {
			const findItem = await this.crmOrganizationRequisite.findFirst({ where: { code1c } });
			if (!findItem) throw new HttpException(OrganizationRequisiteConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
		}
	};

	throwDuplicateError = async (
		dto: { id?: number; code1c: string | undefined } | { id?: number; code1c: string | undefined }[]
	): Promise<void> => {
		const findDuplicate = await this.crmOrganizationRequisite.findFirst({
			where: isArray(dto)
				? {
						OR: dto.map((dtoItem) => ({
							code1c: dtoItem.code1c ? dtoItem.code1c : undefined,
							id: dtoItem.id ? { not: dtoItem.id } : undefined,
						})),
				  }
				: {
						code1c: dto.code1c ? dto.code1c : undefined,
						id: dto.id ? { not: dto.id } : undefined,
				  },
		});
		if (findDuplicate) throw new HttpException(OrganizationRequisiteConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};
}
