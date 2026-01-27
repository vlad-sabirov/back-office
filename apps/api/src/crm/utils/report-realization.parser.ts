import { isArray } from 'lodash';
import { ParserHelper } from 'src/helpers';
import { MutationReportRealizationDto, MutationReportRealizationParsed } from '../dto';
import { QueryReportRealizationDto, QueryReportRealizationParsed } from '../dto';

export class ReportRealizationParser {
	static async parserOptions({
		id,
		year,
		month,
		plan,
		realization,
		customerCount,
		customerNew,
		customerShipment,
		shipmentCount,
		userId,
	}: {
		id?: any;
		year?: any;
		month?: any;
		plan?: any;
		realization?: any;
		customerCount?: any;
		customerNew?: any;
		customerShipment?: any;
		shipmentCount?: any;
		userId?: any;
	}) {
		return {
			id: typeof id !== 'undefined' ? await ParserHelper.toNumber(id) : undefined,
			year: typeof year !== 'undefined' ? await ParserHelper.toNumber(year) : undefined,
			month: typeof month !== 'undefined' ? await ParserHelper.toNumber(month) : undefined,
			plan: typeof plan !== 'undefined' ? await ParserHelper.toNumber(plan) : undefined,
			realization: typeof realization !== 'undefined' ? await ParserHelper.toNumber(realization) : undefined,
			customerCount: typeof customerCount !== 'undefined' ? await ParserHelper.toNumber(customerCount) : undefined,
			customerNew: typeof customerNew !== 'undefined' ? await ParserHelper.toNumber(customerNew) : undefined,
			customerShipment:
				typeof customerShipment !== 'undefined' ? await ParserHelper.toNumber(customerShipment) : undefined,
			shipmentCount: typeof shipmentCount !== 'undefined' ? await ParserHelper.toNumber(shipmentCount) : undefined,
			userId: typeof userId !== 'undefined' ? await ParserHelper.toNumber(userId) : undefined,
		};
	}

	static create = async (crateDto: MutationReportRealizationDto): Promise<MutationReportRealizationParsed> => {
		const {
			year,
			month,
			plan,
			realization,
			customerCount,
			customerNew,
			customerShipment,
			shipmentCount,
			userId,
			...other
		} = crateDto;
		return {
			...other,
			...(await ReportRealizationParser.parserOptions({
				year,
				month,
				plan,
				realization,
				customerCount,
				customerNew,
				customerShipment,
				shipmentCount,
				userId,
			})),
		};
	};

	static update = async (
		crateDto: Partial<MutationReportRealizationDto>
	): Promise<Partial<MutationReportRealizationParsed>> => {
		const {
			year,
			month,
			plan,
			realization,
			customerCount,
			customerNew,
			customerShipment,
			shipmentCount,
			userId,
			...other
		} = crateDto;
		return {
			...other,
			...(await ReportRealizationParser.parserOptions({
				year,
				month,
				plan,
				realization,
				customerCount,
				customerNew,
				customerShipment,
				shipmentCount,
				userId,
			})),
		};
	};

	static query = async (where: QueryReportRealizationDto): Promise<QueryReportRealizationParsed> => {
		const {
			id,
			year,
			month,
			plan,
			realization,
			customerCount,
			customerNew,
			customerShipment,
			shipmentCount,
			userId,
			OR,
			AND,
			NOT,
			...other
		} = where;

		return {
			...other,
			...(await ReportRealizationParser.parserOptions({
				id,
				year,
				month,
				plan,
				realization,
				customerCount,
				customerNew,
				customerShipment,
				shipmentCount,
				userId,
			})),

			OR: !OR
				? undefined
				: isArray(OR)
				? await Promise.all(
						OR.map(async (item) => ({
							...item,
							...(await ReportRealizationParser.parserOptions({
								id: item.id,
								year: item.year,
								month: item.month,
								plan: item.plan,
								realization: item.realization,
								customerCount: item.customerCount,
								customerNew: item.customerNew,
								customerShipment: item.customerShipment,
								shipmentCount: item.shipmentCount,
								userId: item.userId,
							})),
						}))
				  )
				: {
						...OR,
						...(await ReportRealizationParser.parserOptions({
							id: OR.id,
							year: OR.year,
							month: OR.month,
							plan: OR.plan,
							realization: OR.realization,
							customerCount: OR.customerCount,
							customerNew: OR.customerNew,
							customerShipment: OR.customerShipment,
							shipmentCount: OR.shipmentCount,
							userId: OR.userId,
						})),
				  },

			AND: !AND
				? undefined
				: isArray(AND)
				? await Promise.all(
						AND.map(async (item) => ({
							...item,
							...(await ReportRealizationParser.parserOptions({
								id: item.id,
								year: item.year,
								month: item.month,
								plan: item.plan,
								realization: item.realization,
								customerCount: item.customerCount,
								customerNew: item.customerNew,
								customerShipment: item.customerShipment,
								shipmentCount: item.shipmentCount,
								userId: item.userId,
							})),
						}))
				  )
				: {
						...AND,
						...(await ReportRealizationParser.parserOptions({
							id: AND.id,
							year: AND.year,
							month: AND.month,
							plan: AND.plan,
							realization: AND.realization,
							customerCount: AND.customerCount,
							customerNew: AND.customerNew,
							customerShipment: AND.customerShipment,
							shipmentCount: AND.shipmentCount,
							userId: AND.userId,
						})),
				  },

			NOT: !NOT
				? undefined
				: isArray(NOT)
				? await Promise.all(
						NOT.map(async (item) => ({
							...item,
							...(await ReportRealizationParser.parserOptions({
								id: item.id,
								year: item.year,
								month: item.month,
								plan: item.plan,
								realization: item.realization,
								customerCount: item.customerCount,
								customerNew: item.customerNew,
								customerShipment: item.customerShipment,
								shipmentCount: item.shipmentCount,
								userId: item.userId,
							})),
						}))
				  )
				: {
						...NOT,
						...(await ReportRealizationParser.parserOptions({
							id: NOT.id,
							year: NOT.year,
							month: NOT.month,
							plan: NOT.plan,
							realization: NOT.realization,
							customerCount: NOT.customerCount,
							customerNew: NOT.customerNew,
							customerShipment: NOT.customerShipment,
							shipmentCount: NOT.shipmentCount,
							userId: NOT.userId,
						})),
				  },
		};
	};
}
