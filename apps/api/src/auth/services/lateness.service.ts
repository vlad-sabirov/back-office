import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { formatISO, isSameDay, lightFormat, max, min, startOfDay } from 'date-fns';
import { PrismaFilter } from '../../helpers';
import { PrismaService } from '../../common';
import { LatenessEntity } from '../entity';
import { LatenessParser } from '../utils';
import { Prisma } from '@prisma/client';
import { CreateLatenessDto, FindFixLatenessDto, FindLatenessDto, FixLatenessDto, UpdateLatenessDto } from '../dto';
import { LatenessConstants } from '../constants/lateness.constants';
import { ProductionCalendarService } from '../../production-calendar/production-calendar.service';
import { VacationCalendarService } from '../../vacation-calendar/services';

@Injectable()
export class LatenessService extends PrismaService {
	constructor(
		private readonly productionCalendarService: ProductionCalendarService,
		private readonly vacationCalendarService: VacationCalendarService
	) {
		super();
	}
	create = async ({ createDto }: { createDto: CreateLatenessDto }): Promise<LatenessEntity> => {
		const parsedDto = await LatenessParser.create(createDto);
		await this.throwDuplicateError({ userId: createDto.userId, createdAt: parsedDto.createdAt });
		return await this.authLateness.create({
			data: parsedDto as Prisma.Without<Prisma.AuthLatenessUncheckedCreateInput, Prisma.AuthLatenessCreateInput> &
				Prisma.AuthLatenessCreateInput,
		});
	};

	findById = async (id: number | string): Promise<LatenessEntity> => {
		return await this.authLateness.findUnique({ where: { id: Number(id) } });
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: FindLatenessDto;
		filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<LatenessEntity> => {
		const parsedWhere = await LatenessParser.where(where);
		return await this.authLateness.findFirst({ where: parsedWhere, include, ...filter });
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: FindLatenessDto;
		filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<LatenessEntity[]> => {
		const parsedWhere = await LatenessParser.where(where);
		return await this.authLateness.findMany({ where: parsedWhere, include, ...filter });
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: UpdateLatenessDto;
	}): Promise<LatenessEntity> => {
		const data = await LatenessParser.update(updateDto);

		await this.throwNotFoundError({ id: Number(id) });
		const findLateness = await this.findById(id);
		await this.throwDuplicateError({
			id: { not: id },
			userId: findLateness.userId,
			createdAt: findLateness.createdAt,
		});

		return await this.authLateness.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<LatenessEntity> => {
		await this.throwNotFoundError({ id: Number(id) });
		return await this.authLateness.delete({ where: { id: Number(id) } });
	};

	private throwNotFoundError = async (where: FindLatenessDto): Promise<void> => {
		const findItem = await this.findOnce({ where });
		if (!findItem) throw new HttpException(LatenessConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	private throwDuplicateError = async (where: FindLatenessDto): Promise<void> => {
		const parsedWhere = await LatenessParser.where(where);
		const findDuplicate = await this.findOnce({ where: parsedWhere });
		if (findDuplicate) throw new HttpException(LatenessConstants.DUPLICATE, HttpStatus.BAD_REQUEST);
	};

	fixLateness = async (dto: FixLatenessDto): Promise<LatenessEntity> => {
		const { userId, type, comment, metaInfo } = dto;

		const findLateness = await this.findFixLateness({ userId: userId, withoutFilter: true });

		if (findLateness)
			return await this.authLateness.update({
				where: { id: findLateness.id },
				data: {
					userId: Number(userId),
					type: type || '',
					comment: comment || '',
					metaInfo: metaInfo || '',
					createdAt: new Date(),
				},
			});

		return await this.authLateness.create({
			data: {
				userId: Number(userId),
				type: type || '',
				comment: comment || '',
				metaInfo: metaInfo || '',
			},
		});
	};

	findFixLateness = async ({ userId, date, withoutFilter }: FindFixLatenessDto): Promise<LatenessEntity | null> => {
		if (typeof date === 'undefined') date = new Date();
		const DATE_TODAY = new Date();

		return await this.authLateness.findFirst({
			where: {
				userId: Number(userId),
				createdAt: {
					gte: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 00:00:00')),
					lt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 23:59:59')),
				},
				NOT: !withoutFilter
					? [
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 00:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 01:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 02:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 03:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 04:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 05:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 06:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 07:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 08:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 09:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 10:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 11:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 12:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 13:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 14:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 15:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 16:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 17:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 18:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 19:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 20:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 21:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 22:00:00.000')) },
							{ createdAt: new Date(lightFormat(DATE_TODAY, 'yyyy-MM-dd 23:00:00.000')) },
					  ]
					: undefined,
			},
		});
	};

	private convertLatenessToDateRange = async (data: LatenessEntity[]): Promise<{ start: Date; end: Date }> => {
		const result: Date[] = [];
		for (const resultItem of data) {
			if (!result.some((dateItem) => isSameDay(dateItem, resultItem.createdAt)))
				result.push(startOfDay(resultItem.createdAt));
		}
		return { start: min(result), end: max(result) };
	};

	findWithPass = async ({
		where,
		filter,
		include,
	}: {
		where: FindLatenessDto;
		filter?: PrismaFilter<Omit<LatenessEntity, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<LatenessEntity[]> => {
		const findLateness = await this.findMany({ where, filter, include });
		if (!findLateness.length) return;
		const dateArr = await this.convertLatenessToDateRange(findLateness);

		/** Поиск праздников */
		const productionCalendarDays = await this.productionCalendarService.findBetweenDateRange({
			start: formatISO(dateArr.start),
			end: formatISO(dateArr.end),
		});
		let result = findLateness.filter(
			(resultItem) =>
				!productionCalendarDays.some((productionCalendarItem) =>
					isSameDay(resultItem.createdAt, productionCalendarItem)
				)
		);

		/** Поиск отпусков */
		const vacations = await this.vacationCalendarService.findBetweenDateRange({
			start: formatISO(dateArr.start),
			end: formatISO(dateArr.end),
		});
		result = result.filter((resultItem) => {
			return !vacations.some((vacationItem) =>
				vacationItem.dates.some(
					(dateItem) => isSameDay(resultItem.createdAt, dateItem) && resultItem.userId === vacationItem.userId
				)
			);
		});

		return result;
	};
}
