import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { CalendarPropsEvent } from '@fsd/shared/ui-kit';
import { getSortedEventsProps, getSortedEventsResponse } from '.';

export const getSortedEvents = (events: getSortedEventsProps): getSortedEventsResponse => {
	const newEvents = events.map((event) => ({
		...event,
		dateStamp: Number(format(event.dateStart, 't')),
		id: uuid(),
	}));

	newEvents.sort((a, b) => (a.dateStamp > b.dateStamp ? 1 : -1));

	return newEvents.map((event) => {
		// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
		const { dateStamp, ...otherFields } = event;
		return otherFields;
	}) as CalendarPropsEvent[];
};
