import { IOrgAddInitialState } from './org-add.types';

export const initialState: IOrgAddInitialState = {
	values: {
		nameRu: '',
		nameEn: '',
		firstDocument: '',
		website: '',
		comment: '',
		userId: '',
		typeId: '',
		phones: [{ value: '', comment: '' }],
		emails: [{ value: '', comment: '' }],
		tags: [],
		requisites: [],
		contacts: [],
		isVerified: false,
		isReserve: false,
		isArchive: false,
	},
	errors: {},
	isShow: false,
	isLoading: false,
};
