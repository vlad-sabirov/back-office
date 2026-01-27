export interface ICreateDto {
	type: 'comment' | 'log';
	payload: string;
	isSystem: boolean;
	userId?: number | string;
	organizationId?: number | string;
	contactId?: number | string;
}
