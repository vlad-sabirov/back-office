import { format, isSameDay, subDays } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { UTCDate } from '@date-fns/utc';

export const DateToString = (date: Date): string => {
	let output = '';
	const utcToday = new UTCDate(date.getFullYear(), date.getMonth(), date.getDate());

	if (isSameDay(date, new Date())) {
		output = 'Сегодня';
	} else if (isSameDay(date, subDays(new Date(), 1))) {
		output = 'Вчера';
	} else {
		output = format(date, 'dd LLL', { locale: customLocaleRu });
	}

	if (date.getTime() !== utcToday.getTime()) {
		output += format(date, ', HH:mm');
	}

	return output;
};
