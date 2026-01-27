export interface MutationHistoryDto {
	type: string;
	payload: string;
	isSystem: boolean;
	userId?: number | string;
	organizationId?: number | string;
	contactId?: number | string;
}

export interface MutationHistoryParsed {
	type: string;
	payload: string;
	isSystem: boolean;
	userId?: number;
	organizationId?: number;
	contactId?: number;
}
