import { IInitialState } from './org-card-info.slice.types';

export const initialState: IInitialState = {
	isLoading: false,
	modals: {
		changeUserId: false,
		updateOrganization: false,
		toArchive: false,
		toVerified: false,
		toFreedom: false,
		toPriority: false,
		fromArchive: false,
	},
	forms: {
		changeUserId: {
			userId: '',
		},
		updateOrganization: {
			nameEn: '',
			nameRu: '',
			userId: '',
			typeId: '',
			phones: [{ value: '', comment: '' }],
			emails: [{ value: '', comment: '' }],
			website: '',
			tags: [],
			comment: '',
			color: '',
		},
	},
	errors: {
		changeUserId: {},
		updateOrganization: {},
	},
};
