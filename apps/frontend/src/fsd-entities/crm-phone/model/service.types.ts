export interface IApiFindByIdDto {
	phone: string | number;
	ignoreIds?: (string | number)[];
	ignorePhones?: (string | number)[];
}

export interface IApiCreateDto {
	value: string;
	comment: string;
	type: 'organization' | 'contact';
	organizationId?: string | number;
	contactId?: string | number;
}

