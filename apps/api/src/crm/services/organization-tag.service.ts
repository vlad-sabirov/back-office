import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { MutationOrganizationTagDto, QueryOrganizationTagDto } from '../dto';
import { OrganizationTagEntity } from '../entity';
import { OrganizationTagConstants } from '../constants';
import { PrismaFilter } from '../../helpers';
import { OrganizationTagParser } from '../utils';

@Injectable()
export class OrganizationTagService extends PrismaService {
	create = async ({ createDto }: { createDto: MutationOrganizationTagDto }): Promise<OrganizationTagEntity> => {
		const data = await OrganizationTagParser.create(createDto);
		await this.validate({ data });
		await this.throwDuplicateError({ name: data.name });
		return await this.crmOrganizationTag.create({ data });
	};

	findById = async (id: number | string): Promise<OrganizationTagEntity> => {
		return await this.crmOrganizationTag.findUnique({ where: { id: Number(id) } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationTagDto;
		filter?: PrismaFilter<Omit<OrganizationTagEntity, 'organizations'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationTagEntity> => {
		const parsedWhere = await OrganizationTagParser.query(where);
		return await this.crmOrganizationTag.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryOrganizationTagDto;
		filter?: PrismaFilter<Omit<OrganizationTagEntity, 'organizations'>>;
		include?: Record<string, boolean>;
	}): Promise<OrganizationTagEntity[]> => {
		const parsedWhere = await OrganizationTagParser.query(where);
		return await this.crmOrganizationTag.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationOrganizationTagDto>;
	}): Promise<OrganizationTagEntity> => {
		const data = await OrganizationTagParser.update(updateDto);
		await this.validate({ data });
		await this.throwNotFoundError({ id: Number(id) });
		await this.throwDuplicateError({ id: Number(id), name: data.name });
		return await this.crmOrganizationTag.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<OrganizationTagEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		return await this.crmOrganizationTag.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Helpers
	// ------------------------------

	private validate = async (
		{ data }: { data: MutationOrganizationTagDto | Partial<MutationOrganizationTagDto> }
	): Promise<void> => {
		const { name } = data;

		if (name?.length > 32) {
			throw new HttpException(
				OrganizationTagConstants.NAME_LENGTH_ERROR,
				HttpStatus.BAD_REQUEST
			);
		}
	}

	private throwNotFoundError = async ({ id }: { id: number }): Promise<void> => {
		const findItem = await this.crmOrganizationTag.findUnique({ where: { id } });
		if (!findItem) throw new HttpException(OrganizationTagConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async ({ id, name }: { id?: number; name: string }): Promise<void> => {
		const findDuplicate = await this.crmOrganizationTag.findFirst({
			where: {
				name,
				id: id ? { not: id } : undefined,
			},
		});
		if (findDuplicate) throw new HttpException(OrganizationTagConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};
}
