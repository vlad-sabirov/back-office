import  { ITagReducerInitialState } from './tag.types';

export const initialState: ITagReducerInitialState = {
	data: {
		list: [],
		current: null,
	},
	modals: {
		list: false,
		create: false,
		update: false,
		delete: false,
	},
	status: {},
	errors: {},
}
