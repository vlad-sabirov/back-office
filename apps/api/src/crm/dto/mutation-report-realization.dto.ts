export interface MutationReportRealizationDto {
	year: number | string;
	month: number | string;
	plan: number | string;
	realization: number | string;
	customerCount: number | string;
	customerNew: number | string;
	customerShipment: number | string;
	shipmentCount: number | string;
	userId: number | string;
}

export interface MutationReportRealizationParsed {
	year: number;
	month: number;
	plan: number;
	realization: number;
	customerCount: number;
	customerNew: number;
	customerShipment: number;
	shipmentCount: number;
	userId: number;
}
