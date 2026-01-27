import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaFilter } from '../../helpers';
import { PrismaService } from '../../common';
import { ReportRealizationEntity } from '../entity';
import { QueryReportRealizationDto, MutationReportRealizationDto } from '../dto';
import { ReportRealizationParser } from '../utils';
import { ReportsRealizationConstants } from '../constants';

@Injectable()
export class ReportRealizationService extends PrismaService {
	create = async ({ createDto }: { createDto: MutationReportRealizationDto }): Promise<ReportRealizationEntity> => {
		const parsedWhere = await ReportRealizationParser.create(createDto);
		await this.throwDuplicateError({ year: parsedWhere.year, month: parsedWhere.month, userId: parsedWhere.userId });
		return await this.crmReportRealization.create({
			data: parsedWhere,
		});
	};

	findById = async (id: number | string): Promise<ReportRealizationEntity> => {
		return await this.crmReportRealization.findUnique({ where: { id: Number(id) } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryReportRealizationDto;
		filter?: PrismaFilter<Omit<ReportRealizationEntity, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ReportRealizationEntity> => {
		const parsedWhere = await ReportRealizationParser.query(where);
		return await this.crmReportRealization.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryReportRealizationDto;
		filter?: PrismaFilter<Omit<ReportRealizationEntity, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ReportRealizationEntity[]> => {
		const parsedWhere = await ReportRealizationParser.query(where);
		return await this.crmReportRealization.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationReportRealizationDto>;
	}): Promise<ReportRealizationEntity> => {
		const data = await ReportRealizationParser.update(updateDto);
		await this.throwNotFoundError({ id: Number(id) });
		return await this.crmReportRealization.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<ReportRealizationEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		return await this.crmReportRealization.delete({ where: { id: Number(id) } });
	};

	private throwNotFoundError = async (where: QueryReportRealizationDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(ReportsRealizationConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: QueryReportRealizationDto): Promise<void> => {
		const findDuplicate = await this.findOnce({ where });
		if (findDuplicate) throw new HttpException(ReportsRealizationConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};
}
