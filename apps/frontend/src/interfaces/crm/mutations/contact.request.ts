export interface MutationCrmContactRequest {
	name: string;
	workPosition: string;
	birthday?: Date | string;
	comment?: string;
	userId?: number | string;
	isVerified: boolean;
	isArchive: boolean;
}
