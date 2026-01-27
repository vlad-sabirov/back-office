import { CalendarPropsEvent } from '@fsd/shared/ui-kit';

export interface getEventsFromDaysResponse {
	date: Date;
	events?: CalendarPropsEvent[];
	holiday?: CalendarPropsEvent;
	transfer?: CalendarPropsEvent;
}
