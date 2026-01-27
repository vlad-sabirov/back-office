export interface IApiFindByIdDto {
	email: string | number;
	ignoreIds?: (string | number)[];
	ignoreEmails?: string[];
}

export interface IApiCreateDto {
	value: string;
	comment: string;
	type: 'organization' | 'contact';
	organizationId?: string | number;
	contactId?: string | number;
}
