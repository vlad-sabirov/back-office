export interface IOrganizationEntity {
	id: number;
	name: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	userId?: number;
	typeId?: number;
	last1CUpdate?: string;
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	createdAt: string;
	updatedAt: string;
	requisites: { inn: number; code1c: string }[];
}
