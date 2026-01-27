class PrismaPaginationDtoOrder {
	[key: string]: 'asc' | 'desc';
}

export class PrismaSortDto {
	skip?: number;
	take?: number;
	orderBy?: PrismaPaginationDtoOrder[];
}
