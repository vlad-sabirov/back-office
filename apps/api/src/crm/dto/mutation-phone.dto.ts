export interface MutationPhoneDto {
	type: string;
	value: string;
	comment?: string;
	organizationId?: number | string;
	contactId?: number | string;
}

export interface MutationPhoneParsed {
	type: string;
	value: string;
	comment?: string;
	organizationId?: number;
	contactId?: number;
}
