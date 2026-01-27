import { OrganizationEntity } from './organization.entity';
import { ContactEntity } from './contact.entity';

export type PhoneEntity = {
	id: number;
	type: string;
	value: string;
	comment?: string;
	// -------
	organization?: OrganizationEntity[];
	organizationId?: number;
	contact?: ContactEntity[];
	contactId?: number;
	// -------
	createdAt: Date;
	updatedAt: Date;
}
