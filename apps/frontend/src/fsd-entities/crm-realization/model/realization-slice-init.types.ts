import { IMonthRes } from '../api/res';

export interface IRealizationInitialState {
	isLoading: boolean;
	isFetching: boolean;
	currentYear: string;
	currentMonth: string;
	data: {
		monthAll: IMonthRes[];
	};
	type: (typeof IRealizationTypes)[number];
}
export const IRealizationTypes = ['month', 'year'] as const;
