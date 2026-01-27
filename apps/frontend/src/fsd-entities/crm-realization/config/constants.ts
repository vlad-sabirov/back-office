import { parse, startOfMonth } from 'date-fns';

export const COLORS = {
	RED: 50,
	YELLOW: 100,
};

export const ACCESS = {
	DISPLAY_REALIZATION: ['developer', 'crm', 'crmAdmin', 'boss'],
	DISPLAY_ALL_REALIZATION: ['developer', 'crmAdmin', 'boss'],
	REBUILD_REALIZATION: ['developer', 'boss', 'crmAdmin'],
};

export const CONFIG = {
	MIN_DATE: parse('2018-01-01', 'yyyy-MM-dd', new Date()),
	MAX_DATE: startOfMonth(new Date()),
	REBUILD_MIN_DATE: parse('2023-06-01', 'yyyy-MM-dd', new Date()),
};
