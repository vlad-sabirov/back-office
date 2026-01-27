export interface CreateProductCalendarRequest {
	type: string;
	ctx?: string;
	name: string;
	description?: string;
	dateStart: string;
	dateEnd: string;
	isHide?: boolean;
}
