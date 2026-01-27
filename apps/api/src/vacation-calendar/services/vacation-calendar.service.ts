import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { eachDayOfInterval, format, parse, parseISO, startOfDay } from 'date-fns';
import { isArray, isNumber, uniq } from 'lodash';
import { PrismaService } from '../../common';
import { PrismaFilter } from '../../helpers';
import { VacationCalendarConstants } from '../constants';
import { CreateVacationDto, FindVacationDto, UpdateVacationDto } from '../dto';
import { VacationEntity } from '../entities/vacation.entity';
import { IFindDuplicate } from '../interfaces/';
import { VacationParser } from '../utils';

@Injectable()
export class VacationCalendarService extends PrismaService {
	constructor() {
		super();
	}

	create = async (createDto: CreateVacationDto): Promise<VacationEntity> => {
		const data = await VacationParser.createVacation(createDto);
		const { userId, dateStart, dateEnd } = data;
		const dateArray = eachDayOfInterval({ start: dateStart as Date, end: dateEnd as Date });
		await this.findDuplicate({ userId, dateArray: dateArray, error: { status: true } });
		return await this.vacationCalendar.create({ data });
	};

	findById = async (id: number | string, withError?: boolean): Promise<VacationEntity> => {
		const findVacation = await this.vacationCalendar.findUnique({ where: { id: Number(id) } });
		if (withError && !findVacation)
			throw new HttpException(VacationCalendarConstants.VALIDATION.ID.NOT_FOUND, HttpStatus.NOT_FOUND);
		return findVacation;
	};

	findOnce = async (
		where: FindVacationDto,
		filter?: PrismaFilter<Omit<VacationEntity, 'user'>>,
		include?: Record<string, boolean>
	): Promise<VacationEntity> => {
		const parsedWhere = await VacationParser.whereVacation(where);
		return await this.vacationCalendar.findFirst({
			where: { ...parsedWhere } as Prisma.VacationCalendarWhereInput,
			include,
			...filter,
		});
	};

	findMany = async (
		where: FindVacationDto,
		filter?: PrismaFilter<Omit<VacationEntity, 'user'>>,
		include?: Record<string, boolean>
	): Promise<VacationEntity[]> => {
		const parsedWhere = await VacationParser.whereVacation(where);
		return await this.vacationCalendar.findMany({
			where: { ...parsedWhere } as Prisma.VacationCalendarWhereInput,
			include,
			...filter,
		});
	};

	findDuplicate = async ({ userId, dateArray, error }: IFindDuplicate): Promise<VacationEntity> => {
		const findDuplicate = await this.findOnce({
			userId,
			OR: dateArray.map((date) => ({ dateStart: { lte: date }, dateEnd: { gte: date } })),
		});

		const isFind = findDuplicate && error.status;
		const isIgnore = isFind
			? (isNumber(error.ignoreId) && error.ignoreId === findDuplicate.id) ||
			  (isArray(error.ignoreId) && error.ignoreId.some((item) => item === findDuplicate.id))
			: false;

		if (isFind && !isIgnore) {
			throw new HttpException(VacationCalendarConstants.VALIDATION.DUPLICATE, HttpStatus.BAD_REQUEST);
		}

		return findDuplicate;
	};

	findBetweenDate = async (userId: number | string, date: string | string[]): Promise<any> => {
		const dateTransform =
			typeof date === 'string'
				? parse(date, 'yyyy-MM-dd', new Date())
				: date.map((date) => parse(date, 'yyyy-MM-dd', new Date()));

		const findVacation = await this.vacationCalendar.findMany({
			where: isArray(dateTransform)
				? {
						userId: Number(userId),
						OR: [...dateTransform.map((date) => ({ dateStart: { lte: date }, dateEnd: { gte: date } }))],
				  }
				: {
						userId: Number(userId),
						dateStart: { lte: dateTransform },
						dateEnd: { gte: dateTransform },
				  },
		});

		return uniq(
			[].concat(
				...findVacation.map((vacation) =>
					eachDayOfInterval({ start: vacation.dateStart, end: vacation.dateEnd }).map((date) =>
						format(date, 'yyy-MM-dd')
					)
				)
			)
		);
	};

	findBetweenDateRange = async (dto: {
		start: string;
		end: string;
		userId?: number | string;
	}): Promise<{ userId: number; dates: Date[] }[]> => {
		const start = startOfDay(parseISO(dto.start));
		const end = startOfDay(parseISO(dto.end));
		const userId = dto.userId ? Number(dto.userId) : undefined;
		const findVacation = await this.vacationCalendar.findMany({
			where: {
				userId,
				isFake: false,
				OR: [
					{ dateStart: { lte: end }, dateEnd: { gte: start } },
					{ dateStart: { gte: start }, dateEnd: { lte: end } },
				],
			},
		});

		const result = [];
		for (const vacation of findVacation) {
			result.push({
				userId: vacation.userId,
				dates: eachDayOfInterval({ start: vacation.dateStart, end: vacation.dateEnd }),
			});
		}
		return result;
	};

	updateById = async (id: number | string, updateDto: UpdateVacationDto): Promise<VacationEntity> => {
		const data = await VacationParser.updateVacation({ ...updateDto });
		const { userId, dateStart, dateEnd } = data;
		const dateArray = eachDayOfInterval({ start: dateStart, end: dateEnd });

		await this.findById(id, true);
		await this.findDuplicate({ userId, dateArray: dateArray, error: { status: true, ignoreId: Number(id) } });

		return await this.vacationCalendar.update({ where: { id: Number(id) }, data });
	};

	deleteById = async (id: number | string): Promise<VacationEntity> => {
		await this.findById(id, true);
		return await this.vacationCalendar.delete({ where: { id: Number(id) } });
	};
}
