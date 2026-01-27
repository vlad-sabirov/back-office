import { QueryOrganizationTypeDto, QueryOrganizationTypeParsed } from '../dto';
import { MutationOrganizationTypeDto, MutationOrganizationTypeParsed } from '../dto';
import { ParserHelper } from '../../helpers';
import { isArray } from 'lodash';

export class OrganizationTypeParser {
	static async parserOptions(
		{ id, name, createdAt, updatedAt }: 
		{ id?: any; name?: any;  createdAt?: any, updatedAt?: any; }
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

	static create = async (crateDto: MutationOrganizationTypeDto): Promise<MutationOrganizationTypeParsed> => {
		const { name, ...other } = crateDto;
		return { ...other, ...(await OrganizationTypeParser.parserOptions({ name })) };
	};

	static update = async (
		updateDto: Partial<MutationOrganizationTypeDto>
	): Promise<Partial<MutationOrganizationTypeParsed>> => {
		const { name, ...other } = updateDto;
		return { ...other, ...(await OrganizationTypeParser.parserOptions({ name })) };
	};

	static query = async (where: QueryOrganizationTypeDto): Promise<QueryOrganizationTypeParsed> => {
		const { id, name, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await OrganizationTypeParser.parserOptions({ id, name, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await OrganizationTypeParser.parserOptions({
								id: item.id,
								name: item.name,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: { ...OR, ...(await OrganizationTypeParser.parserOptions({
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
							...(await OrganizationTypeParser.parserOptions({
								id: item.id,
								name: item.name,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: { ...AND, ...(await OrganizationTypeParser.parserOptions({
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
							...(await OrganizationTypeParser.parserOptions({
								id: item.id,
								name: item.name,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: { ...NOT, ...(await OrganizationTypeParser.parserOptions({
						id: NOT.id,
						name: NOT.name,
						createdAt: NOT.createdAt,
						updatedAt: NOT.updatedAt,
					})
				)},
		};
	};
}
