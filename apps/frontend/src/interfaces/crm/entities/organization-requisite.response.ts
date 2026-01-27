import { CrmOrganizationResponse } from '@interfaces/crm';

export interface CrmOrganizationRequisiteResponse {
	id: number;
	name: string;
	inn: number;
	code1c: string;
	organization?: CrmOrganizationResponse[];
	organizationId?: number;
	createdAt: Date;
	updatedAt: Date;
}
