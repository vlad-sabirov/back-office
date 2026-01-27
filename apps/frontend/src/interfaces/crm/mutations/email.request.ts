export interface MutationCrmEmailRequest {
	type: 'organization' | 'contact';
	value: string;
	comment?: string;
	organizationId?: number | string;
	contactId?: number | string;
}
