import { IRealizationInitialState } from './realization-slice-init.types';
import { format } from 'date-fns';

const currentDate = new Date();

export const initialState: IRealizationInitialState = {
	isLoading: false,
	isFetching: false,
	currentYear: format(currentDate, 'yyyy'),
	currentMonth: format(currentDate, 'MM'),
	data: {
		monthAll: [],
	},
	type: 'month',
};
