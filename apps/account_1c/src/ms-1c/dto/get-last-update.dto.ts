export interface IGetLastUpdateDto {
	customer?: (string | number)[];
	customer_code?: string[];
	has_shipment?: boolean;
	has_date_of_contract?: boolean;
	has_payment?: boolean;
}
