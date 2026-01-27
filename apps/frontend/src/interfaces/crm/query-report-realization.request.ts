import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryReportRealizationRequest extends PrismaWhereRequest<QueryReportRealizationRequest> {
	id?: CombiningType<number | string>;
	year?: CombiningType<number | string>;
	month?: CombiningType<number | string>;
	plan?: CombiningType<number | string>;
	realization?: CombiningType<number | string>;
	customerCount?: CombiningType<number | string>;
	customerShipment?: CombiningType<number | string>;
	shipmentCount?: CombiningType<number | string>;
	userId?: number;
}
