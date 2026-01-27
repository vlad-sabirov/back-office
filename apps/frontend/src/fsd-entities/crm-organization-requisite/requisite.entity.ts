import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';

export interface IRequisiteEntity {
	id: number;
	name: string;
	inn: number;
	code1c: string;
	organization?: ICrmOrganizationEntity[];
	organizationId?: number;
	createdAt: string;
	updatedAt: string;
}
