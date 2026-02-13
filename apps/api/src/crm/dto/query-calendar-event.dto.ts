import { CombiningType } from '../../helpers';
import { CalendarEventType } from '../entity/calendar-event.entity';

export interface QueryCalendarEventDto {
	id?: CombiningType<number | string>;
	type?: CombiningType<CalendarEventType | CalendarEventType[]>;
	title?: CombiningType<string>;
	authorId?: CombiningType<number | string>;
	assigneeId?: CombiningType<number | string>;
	organizationId?: CombiningType<number | string>;
	contactId?: CombiningType<number | string>;
	taskId?: CombiningType<number | string>;
	dateStart?: CombiningType<Date | string>;
	dateEnd?: CombiningType<Date | string>;
	isAllDay?: CombiningType<boolean>;
	createdAt?: CombiningType<Date | string>;
}

export interface QueryCalendarEventRangeDto {
	from: string | Date;
	to: string | Date;
	userId?: number | string;
}
