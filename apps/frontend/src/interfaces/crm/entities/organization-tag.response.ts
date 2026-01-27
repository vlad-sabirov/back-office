import { CrmOrganizationResponse } from '@interfaces/crm';

export interface CrmOrganizationTagResponse {
	id: number;
	name: string;
	organizations?: CrmOrganizationResponse[];
	createdAt: Date;
	updatedAt: Date;
}
