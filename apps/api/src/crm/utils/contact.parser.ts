import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { MutationContactDto, MutationContactParsed } from '../dto';
import { QueryContactDto, QueryContactParsed } from '../dto';

export class ContactParser {
	static async parserOptions(
		{ id, userId, birthday, createdAt, updatedAt }:
		{ id?: any; userId?: any; birthday?: any, createdAt?: any, updatedAt?: any }
	) {
		return {
			id: typeof id !== 'undefined'
				? await ParserHelper.toNumber(id)
				: undefined,
			userId: typeof userId !== 'undefined' && userId !== 0 && userId !== '0' && userId !== null
				? await ParserHelper.toNumber(userId)
				: userId === null || userId === 0 || userId === '0'
					? null
					: undefined,
			birthday: typeof birthday !== 'undefined' && birthday !== ''
				? await ParserHelper.stringToDate(birthday)
				: undefined,
			createdAt: typeof createdAt !== 'undefined' && createdAt != 0
				? await ParserHelper.stringToDate(createdAt)
				: undefined,
			updatedAt: typeof updatedAt !== 'undefined' && updatedAt != 0
				? await ParserHelper.stringToDate(updatedAt)
				: undefined,
		};
	}

	static create = async (crateDto: MutationContactDto): Promise<MutationContactParsed> => {
		const { userId, birthday, ...other } = crateDto;
		return {
			...other,
			...(await ContactParser.parserOptions({ userId, birthday })),
		};
	};

	static update = async (crateDto: Partial<MutationContactDto>): Promise<Partial<MutationContactParsed>> => {
		const { userId, birthday, ...other } = crateDto;
		return {
			...other,
			...(await ContactParser.parserOptions({ userId, birthday })),
		};
	};

	static query = async (where: QueryContactDto): Promise<QueryContactParsed> => {
		const { id, userId, birthday, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await ContactParser.parserOptions({ id, userId, birthday, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await ContactParser.parserOptions({
								id: item.id,
								userId: item.userId,
								birthday: item.birthday,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await ContactParser.parserOptions({
							id: OR.id,
							userId: OR.userId,
							birthday: OR.birthday,
							createdAt: OR.createdAt,
							updatedAt: OR.updatedAt,
						})),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await ContactParser.parserOptions({
								id: item.id,
								userId: item.userId,
								birthday: item.birthday,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await ContactParser.parserOptions({
							id: AND.id,
							userId: AND.userId,
							birthday: AND.birthday,
							createdAt: AND.createdAt,
							updatedAt: AND.updatedAt,
						})),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await ContactParser.parserOptions({
								id: item.id,
								userId: item.userId,
								birthday: item.birthday,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await ContactParser.parserOptions({ 
							id: NOT.id,
							userId: NOT.userId,
							birthday: NOT.birthday,
							createdAt: NOT.createdAt,
							updatedAt: NOT.updatedAt,
						 })),
				  },
		};
	};
}
