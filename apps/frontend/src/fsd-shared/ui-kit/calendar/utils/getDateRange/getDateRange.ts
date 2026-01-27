import { endOfMonth, startOfMonth } from 'date-fns';
import { getDateRangeResponse } from './';

export const getDateRange = (date: Date): getDateRangeResponse => {
	return {
		start: startOfMonth(date),
		end: endOfMonth(date),
	};
};
