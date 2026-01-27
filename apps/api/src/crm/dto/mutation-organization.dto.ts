export interface MutationOrganizationDto {
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	color?: 'red' | 'green' | 'yellow' | 'purple';
	userId?: number | string;
	typeId?: number | string;
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	last1CUpdate?: string | Date;
}

export interface MutationOrganizationParsed {
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	color?: 'red' | 'green' | 'yellow' | 'purple';
	userId?: number;
	typeId?: number;
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	last1CUpdate?: Date;
}
