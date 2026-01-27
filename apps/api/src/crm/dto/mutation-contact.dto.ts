export interface MutationContactDto {
	name: string;
	workPosition: string;
	birthday: Date | string;
	comment?: string;
	userId?: number | string;
	isVerified: boolean;
	isArchive: boolean;
}

export interface MutationContactParsed {
	name: string;
	workPosition: string;
	birthday: Date;
	comment?: string;
	userId?: number;
	isVerified: boolean;
	isArchive: boolean;
}
