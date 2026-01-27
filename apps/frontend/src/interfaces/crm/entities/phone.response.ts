import { CrmOrganizationResponse, CrmContactResponse } from '@interfaces/crm';

export interface CrmPhoneResponse {
	id: number;
	type: 'organization' | 'contact';
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
