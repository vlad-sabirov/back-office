import { IWorkingBaseInitialState } from './working-base-slice-init.types';

export const initialState: IWorkingBaseInitialState = {
	isLoading: false,
	isFetching: false,
	data: {
		all: {},
		allLast: null,
	},
};
