import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';

export interface ITagEntity {
	id: number;
	name: string;
	organizations?: ICrmOrganizationEntity[];
	createdAt: string;
	updatedAt: string;
}
