import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { CreateLatenessDto, UpdateLatenessDto } from '../dto';
import { FindLatenessDto } from '../dto';
import { IWhereLatenessParser, ICreateLatenessParser, IUpdateLatenessParser } from '../interfaces';

export class LatenessParser {
	static async parserOptions({ id, userId, createdAt }: { id?: any; userId?: any; createdAt?: any }) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			userId: typeof userId !== 'undefined' ? await ParserHelper.toNumber(userId) : undefined,
			createdAt: typeof createdAt !== 'undefined' ? await ParserHelper.stringToDate(createdAt) : undefined,
		};
	}

	static create = async (crateDto: CreateLatenessDto): Promise<ICreateLatenessParser> => {
		const { userId, createdAt, ...other } = crateDto;
		return { ...other, ...(await LatenessParser.parserOptions({ userId, createdAt })) };
	};

	static update = async (crateDto: UpdateLatenessDto): Promise<IUpdateLatenessParser> => {
		const { userId, createdAt, ...other } = crateDto;
		return { ...other, ...(await LatenessParser.parserOptions({ userId, createdAt })) };
	};

	static where = async (where: FindLatenessDto): Promise<IWhereLatenessParser> => {
		const { id, userId, createdAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await LatenessParser.parserOptions({ id, userId, createdAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await LatenessParser.parserOptions({
								id: item.id,
								userId: item.userId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await LatenessParser.parserOptions({ id: OR.id, userId: OR.userId, createdAt: OR.createdAt })),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await LatenessParser.parserOptions({
								id: item.id,
								userId: item.userId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await LatenessParser.parserOptions({ id: AND.id, userId: AND.userId, createdAt: AND.createdAt })),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await LatenessParser.parserOptions({
								id: item.id,
								userId: item.userId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await LatenessParser.parserOptions({ id: NOT.id, userId: NOT.userId, createdAt: NOT.createdAt })),
				  },
		};
	};
}
