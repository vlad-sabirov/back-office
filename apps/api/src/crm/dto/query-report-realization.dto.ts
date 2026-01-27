import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryReportRealizationDto extends PrismaWhere<QueryReportRealizationDto> {
	id?: CombiningType<number | string>;
	year?: CombiningType<number | string>;
	month?: CombiningType<number | string>;
	plan?: CombiningType<number | string>;
	realization?: CombiningType<number | string>;
	customerCount?: CombiningType<number | string>;
	customerNew?: CombiningType<number | string>;
	customerShipment?: CombiningType<number | string>;
	shipmentCount?: CombiningType<number | string>;
	userId?: number;
}

export interface QueryReportRealizationParsed extends PrismaWhere<QueryReportRealizationParsed> {
	id?: CombiningType<number>;
	year?: CombiningType<number>;
	month?: CombiningType<number>;
	plan?: CombiningType<number>;
	realization?: CombiningType<number>;
	customerCount?: CombiningType<number>;
	customerNew?: CombiningType<number>;
	customerShipment?: CombiningType<number>;
	shipmentCount?: CombiningType<number>;
	userId?: number;
}
