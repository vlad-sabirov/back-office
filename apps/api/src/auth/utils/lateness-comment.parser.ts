import { isArray } from 'lodash';
import { ParserHelper } from '../../helpers';
import { CreateLatenessCommentDto, FindLatenessCommentDto, UpdateLatenessCommentDto } from '../dto';
import { ICreateLatenessCommentParser, IUpdateLatenessCommentParser, IWhereLatenessCommentParser } from '../interfaces';

export class LatenessCommentParser {
	static async parserOptions({
		id,
		userId,
		latenessId,
		createdAt,
	}: {
		id?: any;
		userId?: any;
		latenessId?: any;
		createdAt?: any;
	}) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			userId: typeof userId !== 'undefined' ? await ParserHelper.toNumber(userId) : undefined,
			latenessId: typeof latenessId !== 'undefined' ? await ParserHelper.toNumber(latenessId) : undefined,
			createdAt: createdAt ? await ParserHelper.stringToDate(createdAt) : undefined,
		};
	}

	static create = async (where: CreateLatenessCommentDto): Promise<ICreateLatenessCommentParser> => {
		const { userId, latenessId, ...other } = where;
		return { ...other, ...(await LatenessCommentParser.parserOptions({ userId, latenessId })) };
	};

	static update = async (where: UpdateLatenessCommentDto): Promise<IUpdateLatenessCommentParser> => {
		const { userId, latenessId, ...other } = where;
		return { ...other, ...(await LatenessCommentParser.parserOptions({ userId, latenessId })) };
	};

	static where = async (where: FindLatenessCommentDto): Promise<IWhereLatenessCommentParser> => {
		const { id, userId, latenessId, createdAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await LatenessCommentParser.parserOptions({ id, userId, latenessId, createdAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await LatenessCommentParser.parserOptions({
								id: item.id,
								userId: item.userId,
								latenessId: item.latenessId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await LatenessCommentParser.parserOptions({
							id: OR.id,
							userId: OR.userId,
							latenessId: OR.latenessId,
							createdAt: OR.createdAt,
						})),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await LatenessCommentParser.parserOptions({
								id: item.id,
								userId: item.userId,
								latenessId: item.latenessId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await LatenessCommentParser.parserOptions({
							id: AND.id,
							userId: AND.userId,
							latenessId: AND.latenessId,
							createdAt: AND.createdAt,
						})),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await LatenessCommentParser.parserOptions({
								id: item.id,
								userId: item.userId,
								latenessId: item.latenessId,
								createdAt: item.createdAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await LatenessCommentParser.parserOptions({
							id: NOT.id,
							userId: NOT.userId,
							latenessId: NOT.latenessId,
							createdAt: NOT.createdAt,
						})),
				  },
		};
	};
}
