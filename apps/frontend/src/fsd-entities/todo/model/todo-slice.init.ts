import { ITodoInitialState } from './todo-slice-init.types';

export const initialState: ITodoInitialState = {
	isLoading: false,
	isFetching: false,
	data: {
		my: [],
		current: null,
	},
	updateData: {
		my: 42,
	},
	modals: {
		create: false,
		info: false,
	},
	forms: {
		create: {
			name: '',
			dueDate: '',
			assigneeId: 0,
			organizationOrContact: null,
			sendNotificationToTelegram: false,
			description: '',
		},
	},
	formErrors: {
		create: {
			name: '',
			dueDate: '',
			assigneeId: '',
			organizationOrContact: '',
			sendNotificationToTelegram: '',
			description: '',
		},
	},
};
