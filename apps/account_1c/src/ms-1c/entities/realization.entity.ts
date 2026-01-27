export interface IRealizationEntity {
	code: number;
	status: string;
	data: {
		realization: number;
		shipment_count: number;
		customer_shipment: number;
	}[];
}
