import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, endOfYear, startOfMonth, startOfYear } from 'date-fns';
import { getDaysFromYearProps, getDaysFromYearResponse } from '.';

export const getDaysFromYear = (year: getDaysFromYearProps): getDaysFromYearResponse => {
	const result: Date[][] = [];

	const getMonth = eachMonthOfInterval({
		start: startOfYear(new Date(Number(year), 0, 1)),
		end: endOfYear(new Date(Number(year), 0, 1)),
	});

	if (getMonth.length)
		getMonth.forEach((month) => {
			const getDays = eachDayOfInterval({
				start: startOfMonth(month),
				end: endOfMonth(month),
			});

			result.push(getDays);
		});

	return result;
};
