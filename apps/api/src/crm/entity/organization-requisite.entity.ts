import { OrganizationEntity } from '.';

export type OrganizationRequisiteEntity = {
	id: number;
	name: string;
	inn: number;
	code1c: string;
	organization?: OrganizationEntity[];
	organizationId?: number;
	createdAt: Date;
	updatedAt: Date;
}
