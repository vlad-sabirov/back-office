import { IWorkingBaseRes } from '../api/res';

export interface IWorkingBaseInitialState {
	isLoading: boolean;
	isFetching: boolean;
	data: {
		all: Record<string, IWorkingBaseRes>;
		allLast: IWorkingBaseRes | null;
	};
}
