import { CrmOrganizationResponse, CrmContactResponse } from '@interfaces/crm';

export type CrmEmailResponse = {
	id: number;
	type: string;
	value: string;
	comment?: string;
	// -------
	organization?: CrmOrganizationResponse[];
	organizationId?: number;
	contact?: CrmContactResponse[];
	contactId?: number;
	// -------
	createdAt: Date;
	updatedAt: Date;
}
