import { ru } from 'date-fns/locale';

const formatRelativeLocale: Record<string, string> = {
	lastWeek: 'dd MMMM (eeeeee)',
	yesterday: "'вчера'",
	today: "'сегодня'",
	tomorrow: "'завтра'",
	nextWeek: 'dd MMMM (eeeeee)',
	other: 'dd MMMM (eeeeee)',
};

export const customLocaleRu: Locale = {
	...ru,
	formatRelative: (token) => formatRelativeLocale[token],
};
