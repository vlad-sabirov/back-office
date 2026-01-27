import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { MutationHistoryDto, MutationHistoryParsed } from '../dto';
import { QueryHistoryDto, QueryHistoryParsed } from '../dto';

export class HistoryParser {
	static async parserOptions(
		{ id, userId, organizationId, contactId, createdAt, updatedAt }:
		{ id?: any; userId?: any; organizationId?: any; contactId?: any;  createdAt?: any, updatedAt?: any; }
	) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			userId: typeof userId !== 'undefined' ? await ParserHelper.toNumber(userId) : undefined,
			contactId: typeof contactId !== 'undefined' ? await ParserHelper.toNumber(contactId) : undefined,
			organizationId: typeof organizationId !== 'undefined'
				? await ParserHelper.toNumber(organizationId)
				: undefined,
			createdAt: typeof createdAt !== 'undefined' && createdAt != 0
				? await ParserHelper.stringToDate(createdAt)
				: undefined,
			updatedAt: typeof updatedAt !== 'undefined' && updatedAt != 0
				? await ParserHelper.stringToDate(updatedAt)
				: undefined,
		};
	}
	
	static create = async (crateDto: MutationHistoryDto): Promise<MutationHistoryParsed> => {
		const { userId, organizationId, contactId, ...other } = crateDto;
		return {
			...other,
			...(await HistoryParser.parserOptions({ contactId, organizationId, userId })),
		};
	};

	static update = async (crateDto: Partial<MutationHistoryDto>): Promise<Partial<MutationHistoryParsed>> => {
		const { contactId, organizationId, userId, ...other } = crateDto;
		return {
			...other,
			...(await HistoryParser.parserOptions({ contactId, organizationId, userId })),
		};
	};

	static query = async (where: QueryHistoryDto): Promise<QueryHistoryParsed> => {
		const { id, contactId, organizationId, userId, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await HistoryParser.parserOptions({ id, contactId, organizationId, userId, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await HistoryParser.parserOptions({
								id: item.id,
								userId: item.userId,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await HistoryParser.parserOptions({
							id: OR.id,
							userId: OR.userId,
							contactId: OR.contactId,
							organizationId: OR.organizationId,
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
							...(await HistoryParser.parserOptions({
								id: item.id,
								userId: item.userId,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await HistoryParser.parserOptions({
							id: AND.id,
							userId: AND.userId,
							contactId: AND.contactId,
							organizationId: AND.organizationId,
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
							...(await HistoryParser.parserOptions({
								id: item.id,
								userId: item.userId,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await HistoryParser.parserOptions({
							id: NOT.id,
							userId: NOT.userId,
							contactId: NOT.contactId,
							organizationId: NOT.organizationId,
							createdAt: NOT.createdAt,
							updatedAt: NOT.updatedAt,
						})),
				  },
		};
	};
}
