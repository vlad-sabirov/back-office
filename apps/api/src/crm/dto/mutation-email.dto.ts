export interface MutationEmailDto {
	type: string;
	value: string;
	comment?: string;
	organizationId?: number | string;
	contactId?: number | string;
}

export interface MutationEmailParsed {
	type: string;
	value: string;
	comment?: string;
	organizationId?: number;
	contactId?: number;
}
