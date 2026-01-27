import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { MutationOrganizationTypeDto, QueryOrganizationTypeDto } from '../dto';
import { OrganizationTypeConstants } from '../constants';
import { PrismaFilter } from '../../helpers';
import { OrganizationTypeParser } from '../utils';
import { OrganizationTypeEntity } from '../entity';

@Injectable()
export class OrganizationTypeService extends PrismaService {
	create = async ({ createDto }: { createDto: MutationOrganizationTypeDto }): Promise<OrganizationTypeEntity> => {
		const data = await OrganizationTypeParser.create(createDto);
		await this.throwDuplicateError({ name: data.name });
		return await this.crmOrganizationType.create({ data });
	};

	findById = async (id: number | string): Promise<OrganizationTypeEntity> => {
		return await this.crmOrganizationType.findUnique({ where: { id: Number(id) } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationTypeDto;
		filter?: PrismaFilter<Omit<OrganizationTypeEntity, 'organizations'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationTypeEntity> => {
		const parsedWhere = await OrganizationTypeParser.query(where);
		return await this.crmOrganizationType.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationTypeDto;
		filter?: PrismaFilter<Omit<OrganizationTypeEntity, 'organizations'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationTypeEntity[]> => {
		const parsedWhere = await OrganizationTypeParser.query(where);
		return await this.crmOrganizationType.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationOrganizationTypeDto>;
	}): Promise<OrganizationTypeEntity> => {
		const data = await OrganizationTypeParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });
		await this.throwDuplicateError({ id: Number(id), name: data.name });
		return await this.crmOrganizationType.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<OrganizationTypeEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		return await this.crmOrganizationType.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private throwNotFoundError = async ({ id }: { id: number }): Promise<void> => {
		const findItem = await this.crmOrganizationType.findUnique({ where: { id } });
		if (!findItem) throw new HttpException(OrganizationTypeConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async ({ id, name }: { id?: number; name: string }): Promise<void> => {
		const findDuplicate = await this.crmOrganizationType.findFirst({
			where: {
				name,
				id: id ? { not: id } : undefined,
			},
		});
		if (findDuplicate) throw new HttpException(OrganizationTypeConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};
}
