import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { MutationOrganizationDto, MutationOrganizationParsed } from '../dto';
import { QueryOrganizationDto, QueryOrganizationParsed } from '../dto';

export class OrganizationParser {
	static async parserOptions(
		{ id, userId, typeId, createdAt, updatedAt, last1CUpdate }:
		{ id?: any; userId?: any; typeId?: any, createdAt?: any, updatedAt?: any, last1CUpdate?: any; }
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
			typeId: typeof typeId !== 'undefined' && typeId != 0
				? await ParserHelper.toNumber(typeId)
				: undefined,
			last1CUpdate: typeof last1CUpdate !== 'undefined' && last1CUpdate != 0
				? await ParserHelper.stringToDate(last1CUpdate)
				: undefined,
			createdAt: typeof createdAt !== 'undefined' && createdAt != 0
				? await ParserHelper.stringToDate(createdAt)
				: undefined,
			updatedAt: typeof updatedAt !== 'undefined' && updatedAt != 0
				? await ParserHelper.stringToDate(updatedAt)
				: undefined,
		};
	}

	static create = async (crateDto: MutationOrganizationDto): Promise<MutationOrganizationParsed> => {
		const { userId, typeId, last1CUpdate, ...other } = crateDto;
		return { ...other, ...(await OrganizationParser.parserOptions({ userId, typeId, last1CUpdate })) };
	};

	static update = async (crateDto: Partial<MutationOrganizationDto>): Promise<Partial<MutationOrganizationParsed>> => {
		const { userId, typeId, last1CUpdate, ...other } = crateDto;
		return { ...other, ...(await OrganizationParser.parserOptions({ userId, typeId, last1CUpdate })) };
	};

	static query = async (where: QueryOrganizationDto): Promise<QueryOrganizationParsed> => {
		const { id, userId, typeId, createdAt, updatedAt, last1CUpdate, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await OrganizationParser.parserOptions({ id, userId, typeId, createdAt, updatedAt, last1CUpdate })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await OrganizationParser.parserOptions({
								id: item.id,
								userId: item.userId,
								typeId: item.typeId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
								last1CUpdate: item.last1CUpdate,
							})),
						}))
				  )
				: {
						...OR,
						...(await OrganizationParser.parserOptions({
							id: OR.id,
							userId: OR.userId,
							typeId: OR.typeId,
							createdAt: OR.createdAt,
							updatedAt: OR.updatedAt,
							last1CUpdate: OR.last1CUpdate,
						})),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await OrganizationParser.parserOptions({
								id: item.id,
								userId: item.userId,
								typeId: item.typeId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
								last1CUpdate: item.last1CUpdate,
							})),
						}))
				  )
				: {
						...AND,
						...(await OrganizationParser.parserOptions({
							id: AND.id,
							userId: AND.userId,
							typeId: AND.typeId,
							createdAt: AND.createdAt,
							updatedAt: AND.updatedAt,
							last1CUpdate: AND.last1CUpdate,
						})),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await OrganizationParser.parserOptions({
								id: item.id,
								userId: item.userId,
								typeId: item.typeId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
								last1CUpdate: item.last1CUpdate,
							})),
						}))
				  )
				: {
						...NOT,
						...(await OrganizationParser.parserOptions({
							id: NOT.id,
							userId: NOT.userId,
							typeId: NOT.typeId,
							createdAt: NOT.createdAt,
							updatedAt: NOT.updatedAt,
							last1CUpdate: NOT.last1CUpdate,
						})),
				  },
		};
	};
}
