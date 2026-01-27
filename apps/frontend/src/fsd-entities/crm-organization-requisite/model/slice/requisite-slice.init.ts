import { IRequisiteSliceInitialState } from './requisite-slice.types';

export const initialState: IRequisiteSliceInitialState = {
	loading: false,
	current: null,
	form: {
		create: { type: null, name: '', inn: '', code1c: '' },
		update: { id: null, type: null, name: '', inn: '', code1c: '' },
	},
	error: {
		create: {},
		update: {},
	},
	modals: {
		create: false,
		update: false,
		delete: false,
	},
};
