import { UserEntity } from '../../user/entities/user.entity';
import { ContactEntity, OrganizationEntity } from '.';

export type HistoryEntity = {
	id: number;
	type: string;
	payload: any;
	isSystem: boolean;
	// -------
	user?: UserEntity;
	userId?: number;
	organization?: OrganizationEntity;
	organizationId?: number;
	contact?: ContactEntity;
	contactId?: number;
	commentId?: number;
	// -------
	createdAt: Date;
	updatedAt?: Date;
};
