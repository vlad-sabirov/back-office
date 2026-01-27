import { OrganizationEntity } from '.';

export type OrganizationTypeEntity = {
	id: number;
	name: string;
	organizations?: OrganizationEntity[];
	createdAt: Date;
	updatedAt: Date;
}
