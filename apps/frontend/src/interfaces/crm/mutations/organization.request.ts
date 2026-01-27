export interface MutationCrmOrganizationRequest {
	name: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	userId?: number | string;
	typeId?: number | string;
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
}
