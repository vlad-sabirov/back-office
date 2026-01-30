import { IStaffEntity } from '@fsd/entities/staff';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';

export enum EnCrmTaskStatus {
	Pending = 'pending',
	InProgress = 'in_progress',
	Completed = 'completed',
	Cancelled = 'cancelled',
}

export enum EnCrmTaskPriority {
	Low = 'low',
	Normal = 'normal',
	High = 'high',
	Urgent = 'urgent',
}

export interface ICrmTaskModificationEntity {
	id: number;
	taskId: number;
	modifiedBy?: IStaffEntity;
	modifiedById: number;
	changes: string; // JSON строка с описанием изменений
	createdAt: string;
}

export interface ICrmTaskEntity {
	id: number;
	title: string;
	description?: string | null;
	status: EnCrmTaskStatus | string;
	priority: EnCrmTaskPriority | string;
	deadline?: string | null;
	reminderSent3Days: boolean;
	reminderSent1Day: boolean;
	reminderSent2Hours: boolean;
	overdueNotified: boolean;
	// Relations
	author?: IStaffEntity;
	authorId: number;
	assignee?: IStaffEntity;
	assigneeId: number;
	organization?: ICrmOrganizationEntity | null;
	organizationId?: number | null;
	modifications?: ICrmTaskModificationEntity[];
	// Timestamps
	createdAt: string;
	updatedAt: string;
	completedAt?: string | null;
}

export interface ICrmTaskFormEntity {
	title: string;
	description?: string;
	status?: EnCrmTaskStatus | string;
	priority?: EnCrmTaskPriority | string;
	deadline?: string | Date | null;
	authorId: number | string;
	assigneeId: number | string;
	organizationId?: number | string | null;
}
