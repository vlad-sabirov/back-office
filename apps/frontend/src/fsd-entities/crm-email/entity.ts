import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';

export interface IEmailEntity {
	id: number | string;
	type: 'organization' | 'contact';
	value: string;
	comment?: string;
	// -------
	organization?: ICrmOrganizationEntity[];
	organizationId?: number | string;
	contact?: ICrmContactEntity[];
	contactId?: number | string;
	// -------
	createdAt: string;
	updatedAt: string;
}

export type IEmailCreateEntity =
	Pick<IEmailEntity, 'type' | 'value' | 'comment' | 'organizationId' | 'contactId'>;

export interface IEmailFormEntity {
	value: string;
	comment: string;
}
