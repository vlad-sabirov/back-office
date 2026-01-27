import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSortDto, PrismaService } from '../common';
import { CreateEventDto, FilterEventDto, UpdateEventDto } from './dto';
import { ProductionCalendarEntity } from './entities';
import { ProductionCalendarConstants } from './production-calendar.constants';
import { eachDayOfInterval, endOfDay, format, parse, parseISO, startOfDay } from 'date-fns';
import { isArray, uniq } from 'lodash';

@Injectable()
export class ProductionCalendarService extends PrismaService {
	constructor() {
		super();
	}

	create = async (dto: CreateEventDto): Promise<ProductionCalendarEntity> => {
		return await this.productionCalendar.create({
			data: {
				...dto,
				dateStart: parse(dto.dateStart, 'yyyy-MM-dd', new Date()),
				dateEnd: parse(dto.dateEnd, 'yyyy-MM-dd', new Date()),
			},
		});
	};

	findById = async (id: number | string, options?: { checkError: boolean }): Promise<ProductionCalendarEntity> => {
		const findUser = await this.productionCalendar.findUnique({ where: { id: Number(id) } });
		if (options?.checkError)
			if (!findUser)
				throw new HttpException(ProductionCalendarConstants.VALIDATION.ID.NOT_FOUND, HttpStatus.NOT_FOUND);
		return findUser;
	};

	findOnce = async (filter: FilterEventDto, sort?: PrismaSortDto): Promise<ProductionCalendarEntity> => {
		return await this.productionCalendar.findFirst({ where: { ...filter, isHide: filter.isHide || false }, ...sort });
	};

	findMany = async (filter: FilterEventDto, sort?: PrismaSortDto): Promise<ProductionCalendarEntity[]> => {
		return await this.productionCalendar.findMany({ where: { ...filter, isHide: filter.isHide || false }, ...sort });
	};

	findBetweenDate = async (date: string | string[]): Promise<any> => {
		const dateTransform =
			typeof date === 'string'
				? parse(date, 'yyyy-MM-dd', new Date())
				: date.map((date) => parse(date, 'yyyy-MM-dd', new Date()));

		const findVacation = await this.productionCalendar.findMany({
			where: isArray(dateTransform)
				? {
						OR: dateTransform.map((date) => ({ dateStart: { lte: date }, dateEnd: { gte: date } })),
				  }
				: {
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

	findBetweenDateRange = async (dto: { start: string; end: string }): Promise<Date[]> => {
		const start = startOfDay(parseISO(dto.start));
		const end = endOfDay(parseISO(dto.end));
		const findVacation = await this.productionCalendar.findMany({
			where: {
				type: 'holiday',
				isHide: false,
				OR: [
					{ dateStart: { lte: end }, dateEnd: { gte: start } },
					{ dateStart: { gte: start }, dateEnd: { lte: end } },
				],
			},
		});
		const result = [];
		for (const vacation of findVacation) {
			result.push(...eachDayOfInterval({ start: vacation.dateStart, end: vacation.dateEnd }));
		}
		return result;
	};

	updateById = async (id: number | string, dto: UpdateEventDto): Promise<ProductionCalendarEntity> => {
		await this.findById(id, { checkError: true });
		return await this.productionCalendar.update({
			where: { id: Number(id) },
			data: {
				...dto,
				dateStart: parse(dto.dateStart, 'yyyy-MM-dd', new Date()),
				dateEnd: parse(dto.dateEnd, 'yyyy-MM-dd', new Date()),
			},
		});
	};

	deleteById = async (id: number | string): Promise<ProductionCalendarEntity> => {
		await this.findById(id, { checkError: true });
		return await this.productionCalendar.delete({ where: { id: Number(id) } });
	};

	hideById = async (id: number | string): Promise<ProductionCalendarEntity> => {
		await this.findById(id, { checkError: true });
		return await this.productionCalendar.update({ where: { id: Number(id) }, data: { isHide: true } });
	};
}
