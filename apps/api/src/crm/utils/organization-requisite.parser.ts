import { QueryOrganizationRequisiteDto, QueryOrganizationRequisiteParsed } from '../dto';
import { MutationOrganizationRequisiteDto, MutationOrganizationRequisiteParsed } from '../dto';
import { ParserHelper } from '../../helpers';
import { isArray } from 'lodash';

export class OrganizationRequisiteParser {
	static async parserOptions(
		{ id, name, inn, code1c, organizationId, createdAt, updatedAt }:
		{ id?: any; name?: any; inn?: any; code1c?: any; organizationId?: any; createdAt?: any, updatedAt?: any; }
	) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			name: typeof name !== 'undefined' ? name : undefined,
			inn: typeof inn !== 'undefined' ? await ParserHelper.toNumber(inn) : undefined,
			code1c: typeof code1c !== 'undefined' ? code1c : undefined,
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

	static create = async (crateDto: MutationOrganizationRequisiteDto): Promise<MutationOrganizationRequisiteParsed> => {
		const { name, inn, code1c, organizationId, ...other } = crateDto;
		return { ...other, ...(await OrganizationRequisiteParser.parserOptions({ name, inn, code1c, organizationId })) };
	};

	static update = async (
		updateDto: Partial<MutationOrganizationRequisiteDto>
	): Promise<Partial<MutationOrganizationRequisiteParsed>> => {
		const { name, inn, code1c, organizationId, ...other } = updateDto;
		return { ...other, ...(await OrganizationRequisiteParser.parserOptions({ name, inn, code1c, organizationId })) };
	};

	static query = async (where: QueryOrganizationRequisiteDto): Promise<QueryOrganizationRequisiteParsed> => {
		const { id, name, inn, code1c, organizationId, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await OrganizationRequisiteParser.parserOptions({ id, inn, code1c, name, organizationId, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await OrganizationRequisiteParser.parserOptions({
								id: item.id,
								inn: item.inn,
								code1c: item.code1c,
								name: item.name,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await OrganizationRequisiteParser.parserOptions({
							id: OR.id,
							inn: OR.inn,
							code1c: OR.code1c,
							name: OR.name,
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
							...(await OrganizationRequisiteParser.parserOptions({
								id: item.id,
								inn: item.inn,
								code1c: item.code1c,
								name: item.name,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await OrganizationRequisiteParser.parserOptions({
							id: AND.id,
							inn: AND.inn,
							code1c: AND.code1c,
							name: AND.name,
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
							...(await OrganizationRequisiteParser.parserOptions({
								id: item.id,
								inn: item.inn,
								code1c: item.code1c,
								name: item.name,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await OrganizationRequisiteParser.parserOptions({
							id: NOT.id,
							inn: NOT.inn,
							code1c: NOT.code1c,
							name: NOT.name,
							organizationId: NOT.organizationId,
							createdAt: NOT.createdAt,
							updatedAt: NOT.updatedAt,
						})),
				  },
		};
	};
}
