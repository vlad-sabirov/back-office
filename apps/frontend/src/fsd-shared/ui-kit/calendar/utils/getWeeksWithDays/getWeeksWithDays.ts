import { eachDayOfInterval, eachWeekOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import { CalendarProps } from '@fsd/shared/ui-kit';
import { getWeeksWithDaysResponse } from '.';

export const getWeeksWithDays = (
	start: Date,
	end: Date,
	startDay?: CalendarProps['startDay'],
): getWeeksWithDaysResponse => {
	const weeks = eachWeekOfInterval({
		start: startOfWeek(start, { weekStartsOn: !startDay || startDay === 'monday' ? 1 : undefined }),
		end: endOfWeek(end, { weekStartsOn: !startDay || startDay === 'monday' ? 1 : undefined }),
	});
	if (!weeks.length) return [[]];

	return weeks
		.filter((week, index) => index !== 0)
		.map((week) => {
			return eachDayOfInterval({
				start: startOfWeek(week, { weekStartsOn: !startDay || startDay === 'monday' ? 1 : undefined }),
				end: endOfWeek(week, { weekStartsOn: !startDay || startDay === 'monday' ? 1 : undefined }),
			});
		});
};
