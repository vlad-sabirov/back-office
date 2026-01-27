import { IInitialState } from './initial.types';

export const initialState: IInitialState = {
	isFetching: false,
	modals: {
		planList: false,
		planCreate: false,
		planUpdate: false,
		planRemove: false,
	},
	forms: {
		planCreate: {
			year: '',
			month: '',
			teams: {},
		},
		planUpdate: {
			year: '',
			month: '',
			teams: {},
		},
	},
	errors: {
		planCreate: {
			date: '',
			employees: {},
			teams: {},
		},
		planUpdate: {
			date: '',
			employees: {},
			teams: {},
		},
	},
};
