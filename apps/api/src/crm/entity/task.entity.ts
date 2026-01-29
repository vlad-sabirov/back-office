import { UserEntity } from '../../user/entities/user.entity';
import { OrganizationEntity } from './organization.entity';

export interface TaskEntity {
	id: number;
	title: string;
	description?: string | null;
	status: string;
	priority: string;
	deadline?: Date | null;
	reminderSent3Days: boolean;
	reminderSent1Day: boolean;
	reminderSent2Hours: boolean;
	overdueNotified: boolean;
	// -------
	author?: UserEntity;
	authorId: number;
	assignee?: UserEntity;
	assigneeId: number;
	organization?: OrganizationEntity | null;
	organizationId?: number | null;
	// -------
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date | null;
}
