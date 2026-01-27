import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { MutationPhoneDto, MutationPhoneParsed } from '../dto';
import { QueryPhoneDto, QueryPhoneParsed } from '../dto';

export class PhoneParser {
	static async parserOptions(
		{ id, value, organizationId, contactId, createdAt, updatedAt }:
		{ id?: any; value?: any; organizationId?: any; contactId?: any;  createdAt?: any, updatedAt?: any; }
	) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			value: typeof value !== 'undefined' ? String(await ParserHelper.toPhone(value)) : '',
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
	
	static create = async (crateDto: MutationPhoneDto): Promise<MutationPhoneParsed> => {
		const { contactId, organizationId, value, ...other } = crateDto;
		return {
			...other,
			...(await PhoneParser.parserOptions({ contactId, organizationId, value })),
		};
	};

	static update = async (crateDto: Partial<MutationPhoneDto>): Promise<Partial<MutationPhoneParsed>> => {
		const { contactId, organizationId, value, ...other } = crateDto;
		return {
			...other,
			...(await PhoneParser.parserOptions({ contactId, organizationId, value })),
		};
	};

	static query = async (where: QueryPhoneDto): Promise<QueryPhoneParsed> => {
		const { id, contactId, organizationId, value, createdAt, updatedAt, OR, AND, NOT, ...other } = where;

		return {
			...other,
			...(await PhoneParser.parserOptions({ id, contactId, organizationId, value, createdAt, updatedAt })),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await PhoneParser.parserOptions({
								id: item.id,
								value: item.value,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...OR,
						...(await PhoneParser.parserOptions({
							id: OR.id,
							value: OR.value,
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
							...(await PhoneParser.parserOptions({
								id: item.id,
								value: item.value,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...AND,
						...(await PhoneParser.parserOptions({
							id: AND.id,
							value: AND.value,
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
							...(await PhoneParser.parserOptions({
								id: item.id,
								value: item.value,
								contactId: item.contactId,
								organizationId: item.organizationId,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							})),
						}))
				  )
				: {
						...NOT,
						...(await PhoneParser.parserOptions({
							id: NOT.id,
							value: NOT.value,
							contactId: NOT.contactId,
							organizationId: NOT.organizationId,
							createdAt: NOT.createdAt,
							updatedAt: NOT.updatedAt,
						})),
				  },
		};
	};
}
