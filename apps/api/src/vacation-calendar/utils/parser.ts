import { eachDayOfInterval } from 'date-fns';
import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { CreateVacationDto, FindVacationDto, UpdateVacationDto } from '../dto';
import { ICreateVacationParser, IUpdateVacationParser, IWhereVacationParser } from '../interfaces';

export class VacationParser {
	static async parserOptions({ userId, dateStart, dateEnd }: { userId?: any; dateStart?: any; dateEnd?: any }) {
		return {
			userId: typeof userId !== 'undefined' ? await ParserHelper.toNumber(userId) : undefined,
			dateStart: dateStart ? await ParserHelper.stringToDate(dateStart) : undefined,
			dateEnd: dateEnd ? await ParserHelper.stringToDate(dateEnd) : undefined,
		};
	}

	static async whereDateInterval(start: Date, end: Date) {
		return eachDayOfInterval({ start, end });
	}

	static createVacation = async (where: CreateVacationDto): Promise<ICreateVacationParser> => {
		const { userId, dateStart, dateEnd, ...other } = where;
		return { ...other, ...(await VacationParser.parserOptions({ userId, dateStart, dateEnd })) };
	};

	static updateVacation = async (where: UpdateVacationDto): Promise<IUpdateVacationParser> => {
		const { userId, dateStart, dateEnd, ...other } = where;

		return { ...other, ...(await VacationParser.parserOptions({ userId, dateStart, dateEnd })) };
	};

	static whereVacation = async (where: FindVacationDto): Promise<IWhereVacationParser> => {
		const { userId, dateStart, dateEnd, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await VacationParser.parserOptions({ userId, dateStart, dateEnd })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await VacationParser.parserOptions({
								userId: item.userId,
								dateStart: item.dateStart,
								dateEnd: item.dateEnd,
							})),
						}))
				  )
				: {
						...OR,
						...(await VacationParser.parserOptions({
							userId: OR.userId,
							dateStart: OR.dateStart,
							dateEnd: OR.dateEnd,
						})),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await VacationParser.parserOptions({
								userId: item.userId,
								dateStart: item.dateStart,
								dateEnd: item.dateEnd,
							})),
						}))
				  )
				: {
						...AND,
						...(await VacationParser.parserOptions({
							userId: AND.userId,
							dateStart: AND.dateStart,
							dateEnd: AND.dateEnd,
						})),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await VacationParser.parserOptions({
								userId: item.userId,
								dateStart: item.dateStart,
								dateEnd: item.dateEnd,
							})),
						}))
				  )
				: {
						...NOT,
						...(await VacationParser.parserOptions({
							userId: NOT.userId,
							dateStart: NOT.dateStart,
							dateEnd: NOT.dateEnd,
						})),
				  },
		};
	};
}
