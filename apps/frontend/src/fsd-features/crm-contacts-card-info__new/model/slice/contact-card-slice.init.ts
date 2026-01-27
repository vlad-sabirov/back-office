import { IContactCardSliceInitialState } from "./contact-card-slice.types";

export const initialState: IContactCardSliceInitialState = {
	loading: false,
	current: null,
	searchStep: 'search',
	searchResult: [],
	modals: {
		search: false,
		create: false,
		update: false,
		delete: false,
		disconnect: false,
	},
	forms: {
		search: {
			name: '',
			phone: '',
		},
		create: {
			name: '',
			workPosition: '',
			userId: '',
			phones: [{ value: '', comment: '' }],
			emails: [{ value: '', comment: '' }],
			birthday: '',
			comment: '',
		},
		update: {
			name: '',
			workPosition: '',
			userId: '',
			phones: [{ value: '', comment: '' }],
			emails: [{ value: '', comment: '' }],
			birthday: '',
			comment: '',
		},
	},
	errors: {
		create: {},
		update: {},
	},
}


