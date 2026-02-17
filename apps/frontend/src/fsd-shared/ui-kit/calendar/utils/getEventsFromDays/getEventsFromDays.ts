import { format, isWithinInterval, parse } from 'date-fns';
import { CalendarPropsEvent } from '@fsd/shared/ui-kit';
import { getEventsFromDaysProps, getEventsFromDaysResponse } from '.';

export const getEventsFromDays = ({ dates, events }: getEventsFromDaysProps): getEventsFromDaysResponse[] => {
	const limitDisplay = 5;

	const result: getEventsFromDaysResponse[] = dates.map((date) => {
		const foundedEvent: CalendarPropsEvent[] = [];
		let foundedHoliday: CalendarPropsEvent | undefined = undefined;
		let foundedTransfer: CalendarPropsEvent | undefined = undefined;

		events?.forEach((event) => {
			if (
				isWithinInterval(parse(format(date, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()), {
					start: parse(format(event.dateStart, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()),
					end: parse(format(event.dateEnd, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()),
				})
			)
				event.type === 'holiday'
					? (foundedHoliday = { ...event })
					: event.type === 'transfer'
					? (foundedTransfer = { ...event })
					: foundedEvent.push({ ...event });
		});

		return { date, events: foundedEvent, holiday: foundedHoliday, transfer: foundedTransfer };
	});

	result.map((day, dayIndex) => {
		const positionStamp: number[] = [0, 0, 0, 0, 0];
		const newEvents = day.events?.length
			? day.events.map((event, index) => {
					const findPrev = result?.[dayIndex - 1]?.events?.filter(
						(lastEvent) => lastEvent.id === event.id
					)?.[0];

					if (findPrev?.slot?.position) positionStamp[findPrev.slot.position - 1] = 1;

					const position = findPrev?.slot?.position
						? findPrev?.slot?.position
						: !positionStamp[0]
						? 1
						: !positionStamp[1]
						? 2
						: !positionStamp[2]
						? 3
						: !positionStamp[3]
						? 4
						: !positionStamp[4]
						? 5
						: 0;

					if (!findPrev?.slot?.position && position > 0) positionStamp[position - 1] = 1;

					const display = !findPrev && index < limitDisplay;

					event.slot = { position, display };
					return { ...event };
				})
			: [];

		return { ...day, events: newEvents };
	});

	return result;
};
