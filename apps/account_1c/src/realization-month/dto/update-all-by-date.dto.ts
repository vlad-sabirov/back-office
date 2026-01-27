import { RealizationMonthModel } from '../models/realization-month-all.model';

export type IUpdateAllByDateDto = {
	year: number | string;
	month: number | string;
	data: Pick<RealizationMonthModel, 'year' | 'month'> &
		Partial<Omit<RealizationMonthModel, 'year' | 'month'>>;
};
