import * as reducers from './reducers';
import { ICrmContactReducer, ICrmContactVoip } from './slice.types';
import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Const } from '../config/const';

export const initialState: ICrmContactReducer = {
	data: {
		list: [],
		current: null,
		voip: {},
		all: {},
	},
	forms: {
		create: {
			values: {
				name: '',
				userId: '',
				workPosition: '',
				birthday: '',
				comment: '',
				phones: [{ value: '', comment: '' }],
				emails: [{ value: '', comment: '' }],
				organizations: [],
			},
			errors: {},
		},
		update: {
			values: {
				name: '',
				userId: '',
				workPosition: '',
				birthday: '',
				comment: '',
				phones: [{ value: '', comment: '' }],
				emails: [{ value: '', comment: '' }],
			},
			errors: {},
		},
	},
	count: {
		total: 0,
		full: 0,
		medium: 0,
		low: 0,
		empty: 0,
		all: 0,
	},
	filter: {
		list: { page: 1, limit: 25 },
	},
	modals: {
		search: false,
		update: false,
		delete: false,
	},
	status: {},
	errors: {},
};

const CrmContactSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataCurrent: reducers.setDataCurrent,
		setDataList: reducers.setDataList,
		setDataVoip: (state, action: PayloadAction<Record<string, ICrmContactVoip>>): void => {
			state.data.voip = action.payload;
		},
		setDataAll: (state, action: PayloadAction<Record<string | number, ICrmContactEntity>>): void => {
			state.data.all = action.payload;
		},
		setFilterList: reducers.setFilterList,
		setFormCreateField: reducers.setFormCreateField,
		setFormCreateReset: reducers.setFormCreateReset,
		setFormEditCurrent: reducers.setFormEditCurrent,
		setFormEdit: reducers.setFormEdit,
		setModalShow: reducers.setModalShow,
		setStatusCurrent: reducers.setStatusCurrent,
		setStatusList: reducers.setStatusList,
	},
});

export const CrmContactReducer = CrmContactSlice.reducer;
export const CrmContactActions = CrmContactSlice.actions;
