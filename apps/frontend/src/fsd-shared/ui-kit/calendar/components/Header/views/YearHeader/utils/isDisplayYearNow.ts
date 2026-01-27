import { differenceInHours, format, isSameYear, isWithinInterval } from 'date-fns';

export const isDisplayYearNow = (min?: Date, max?: Date): boolean => {
	const dateNow = new Date();

	const isMinMaxNotFound = !min && !max;
	const isWithinIntervalFromNow = min && max && isWithinInterval(dateNow, { start: min, end: max });
	const isLessMinFromNow = min && !max && differenceInHours(dateNow, min) >= 0;
	const isLessMaxFromNow = !max && max && differenceInHours(dateNow, max) <= 0;
	const isSameMin = min && isSameYear(dateNow, min);
	const isSameMax = max && isSameYear(dateNow, max);
	const isOneDateAvailable =
		min &&
		max &&
		format(dateNow, 'yyyy') === format(min, 'yyyy') &&
		format(dateNow, 'yyyy') === format(max, 'yyyy');

	return !!(
		isMinMaxNotFound ||
		isWithinIntervalFromNow ||
		isLessMinFromNow ||
		isLessMaxFromNow ||
		isSameMin ||
		isSameMax ||
		isOneDateAvailable
	);
};
