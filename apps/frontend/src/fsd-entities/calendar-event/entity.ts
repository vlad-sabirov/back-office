import { IStaffEntity } from '@fsd/entities/staff';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { ICrmTaskEntity } from '@fsd/entities/crm-task';

export enum EnCalendarEventType {
	Meeting = 'meeting',
	Call = 'call',
	Note = 'note',
	Reminder = 'reminder',
}

export interface ICalendarEventEntity {
	id: number;
	type: EnCalendarEventType | string;
	title: string;
	description?: string | null;
	dateStart: string;
	dateEnd: string;
	isAllDay: boolean;
	location?: string | null;
	// Relations
	author?: IStaffEntity;
	authorId: number;
	assignee?: IStaffEntity;
	assigneeId: number;
	organization?: ICrmOrganizationEntity | null;
	organizationId?: number | null;
	contact?: ICrmContactEntity | null;
	contactId?: number | null;
	task?: ICrmTaskEntity | null;
	taskId?: number | null;
	// Timestamps
	createdAt: string;
	updatedAt: string;
}

export interface ICalendarEventFormEntity {
	type: EnCalendarEventType | string;
	title: string;
	description?: string;
	dateStart: string | Date;
	dateEnd: string | Date;
	isAllDay?: boolean;
	location?: string;
	authorId: number | string;
	assigneeId: number | string;
	organizationId?: number | string | null;
	contactId?: number | string | null;
	taskId?: number | string | null;
}

export interface IRangeWithTasksResponse {
	events: ICalendarEventEntity[];
	tasks: ICrmTaskEntity[];
}

export interface ITodayPlanResponse {
	events: ICalendarEventEntity[];
	tasks: ICrmTaskEntity[];
}
