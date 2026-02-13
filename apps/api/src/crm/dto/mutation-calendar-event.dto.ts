import { CalendarEventType } from '../entity/calendar-event.entity';

export interface MutationCalendarEventDto {
	type: CalendarEventType;
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
