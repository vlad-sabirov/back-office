import { OrganizationEntity } from '.';

export type OrganizationTagEntity = {
	id: number;
	name: string;
	organizations?: OrganizationEntity[];
	createdAt: Date;
	updatedAt: Date;
}
