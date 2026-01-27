import { IVoipInitialState } from './voip-slice-init.types';
import { endOfMonth, format, startOfMonth } from 'date-fns';

export const initialState: IVoipInitialState = {
	isLoading: false,
	isFetching: false,
	config: {
		incoming: {
			date: {
				start: format(startOfMonth(new Date()), 'yyyy-MM-dd') + 'T00:00:00Z',
				end: format(endOfMonth(new Date()), 'yyyy-MM-dd') + 'T00:00:00Z',
			},
			page: 1,
			limit: 15,
		},
	},
	callModal: {
		uuid: '',
		isShowModal: false,
	},
	refresh: {
		missed: '',
	},
	data: {
		my: null,
		events: [],
		missed: [],
	},
};
