import { UserEntity } from '../../user/entities/user.entity';
import { OrganizationEntity } from './organization.entity';
import { ContactEntity } from './contact.entity';
import { TaskEntity } from './task.entity';

export type CalendarEventType = 'meeting' | 'call' | 'note' | 'reminder';
export type CalendarEventStatus = 'active' | 'completed' | 'cancelled';

export interface CalendarEventParticipantEntity {
	id: number;
	eventId: number;
	userId: number;
	status: string;
	user?: UserEntity;
	createdAt: Date;
}

export interface CalendarEventEntity {
	id: number;
	type: string;
	title: string;
	description?: string | null;
	dateStart: Date;
	dateEnd: Date;
	isAllDay: boolean;
	location?: string | null;
	status: string;
	completedAt?: Date | null;
	// Reminder fields
	reminderSent1Day?: boolean;
	reminderSent2Hours?: boolean;
	reminderSent1Hour?: boolean;
	reminderFired?: boolean;
	// -------
	author?: UserEntity;
	authorId: number;
	assignee?: UserEntity;
	assigneeId: number;
	organization?: OrganizationEntity | null;
	organizationId?: number | null;
	contact?: ContactEntity | null;
	contactId?: number | null;
	task?: TaskEntity | null;
	taskId?: number | null;
	participants?: CalendarEventParticipantEntity[];
	// -------
	createdAt: Date;
	updatedAt: Date;
}
