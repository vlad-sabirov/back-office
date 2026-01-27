import { CrmOrganizationResponse } from '@interfaces/crm';

export interface CrmOrganizationTypeResponse {
	id: number;
	name: string;
	organizations?: CrmOrganizationResponse[];
	createdAt: Date;
	updatedAt: Date;
}
