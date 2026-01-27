export interface MutationOrganizationRequisiteDto {
	name: string;
	inn?: string | number;
	code1c: string;
	organizationId: string | number;
}

export interface MutationOrganizationRequisiteParsed {
	name: string;
	inn?: number;
	code1c: string;
	organizationId: number;
}
