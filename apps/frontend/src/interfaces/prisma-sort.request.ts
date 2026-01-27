class PrismaSortRequestOrder {
	[key: string]: 'asc' | 'desc';
}

export class PrismaSortRequest {
	skip?: number;
	take?: number;
	orderBy?: PrismaSortRequestOrder[];
}
