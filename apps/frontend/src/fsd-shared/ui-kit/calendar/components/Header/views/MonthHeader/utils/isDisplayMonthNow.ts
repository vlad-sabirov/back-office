import { differenceInHours, isSameMonth, isWithinInterval } from 'date-fns';

export const isDisplayMonthNow = (min?: Date, max?: Date): boolean => {
	const dateNow = new Date();
	const isMinMaxNotFound = !min && !max;
	const isWithinIntervalFromNow = min && max && isWithinInterval(dateNow, { start: min, end: max });
	const isLessMinFromNow = min && !max && differenceInHours(dateNow, min) >= 0;
	const isLessMaxFromNow = !max && max && differenceInHours(dateNow, max) <= 0;
	const isSameMin = min && isSameMonth(dateNow, min);
	const isSameMax = max && isSameMonth(dateNow, max);

	return !!(
		isMinMaxNotFound ||
		isWithinIntervalFromNow ||
		isLessMinFromNow ||
		isLessMaxFromNow ||
		isSameMin ||
		isSameMax
	);
};
