import { QueryOrganizationTagDto, QueryOrganizationTagParsed } from '../dto';
import { MutationOrganizationTagDto, MutationOrganizationTagParsed } from '../dto';
import { isArray } from 'lodash';
import { ParserHelper } from '../../helpers';

export class OrganizationTagParser {
	static async parserOptions(
		{ id, name, createdAt, updatedAt }: 
		{ id?: any; name?: any; createdAt?: any, updatedAt?: any; }
	) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			name: typeof name !== 'undefined' ? name.trim().toLowerCase() : undefined,
			createdAt: typeof createdAt !== 'undefined' && createdAt != 0
				? await ParserHelper.stringToDate(createdAt)
				: undefined,
			updatedAt: typeof updatedAt !== 'undefined' && updatedAt != 0
				? await ParserHelper.stringToDate(updatedAt)
				: undefined,
		};
	}

	static create = async (crateDto: MutationOrganizationTagDto): Promise<MutationOrganizationTagParsed> => {
		const { name, ...other } = crateDto;
		return { ...other, ...(await OrganizationTagParser.parserOptions({ name })) };
	};

	static update = async (
		updateDto: Partial<MutationOrganizationTagDto>
	): Promise<Partial<MutationOrganizationTagParsed>> => {
		const { name, ...other } = updateDto;
		return { ...other, ...(await OrganizationTagParser.parserOptions({ name })) };
	};

	static query = async (where: QueryOrganizationTagDto): Promise<QueryOrganizationTagParsed> => {
		const { id, name, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await OrganizationTagParser.parserOptions({ id, name, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({ ...item, ...(await OrganizationTagParser.parserOptions({
							id: item.id,
							name: item.name,
							createdAt: item.createdAt,
							updatedAt: item.updatedAt,
						})) }))
				  )
				: { ...OR, ...(await OrganizationTagParser.parserOptions({
						id: OR.id,
						name: OR.name,
						createdAt: OR.createdAt,
						updatedAt: OR.updatedAt,
					})
				)},

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await OrganizationTagParser.parserOptions({
								id: item.id,
								name: item.name,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: { ...AND, ...(await OrganizationTagParser.parserOptions({
						id: AND.id,
						name: AND.name,
						createdAt: AND.createdAt,
						updatedAt: AND.updatedAt,
					})
				)},

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await OrganizationTagParser.parserOptions({
								id: item.id,
								name: item.name,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: { ...NOT, ...(await OrganizationTagParser.parserOptions({
						id: NOT.id,
						name: NOT.name,
						createdAt: NOT.createdAt,
						updatedAt: NOT.updatedAt,
					})
				)},
		};
	};
}
