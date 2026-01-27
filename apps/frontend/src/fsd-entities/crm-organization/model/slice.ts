import * as reducers from './reducers';
import { ICrmOrganizationReducer, ICrmOrganizationVoip } from './slice.types';
import { format } from 'date-fns';
import { merge } from 'lodash';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CrmOrganizationConst as Const } from '../config/const';

const initialState: ICrmOrganizationReducer = {
	data: {
		list: [],
		current: null,
		voip: {},
		all: {},
	},
	count: {
		total: 0,
		all: 0,
		full: 0,
		medium: 0,
		low: 0,
		empty: 0,
		unverified: 0,
	},
	filter: {
		list: { page: 1, limit: 25 },
		dateOfNew: {
			year: format(new Date(), 'yyyy'),
			month: format(new Date(), 'MM'),
		},
	},
	modals: {
		create: false,
	},
	status: {},
	errors: {},
};

const crmOrganizationSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataCurrent: reducers.setDataCurrent,
		setDataList: reducers.setDataList,
		setDataVoip: (state, action: PayloadAction<Record<string, ICrmOrganizationVoip>>): void => {
			state.data.voip = action.payload;
		},
		setDataAll: (state, action: PayloadAction<Record<string | number, ICrmOrganizationEntity>>): void => {
			state.data.all = action.payload;
		},
		setFilterList: reducers.setFilterList,
		setFilterDateOfNew: (state, action: PayloadAction<{ year: string; month: string }>): void => {
			state.filter.dateOfNew = action.payload;
		},
		setModalShow: reducers.setModalShow,
		setStatusCurrent: reducers.setStatusCurrent,
		setStatusList: reducers.setStatusList,
		setCount: (
			state,
			{ payload }: PayloadAction<Partial<Record<keyof ICrmOrganizationReducer['count'], number>>>
		) => {
			state.count = merge(state.count, payload);
		},
	},
});

export const CrmOrganizationReducer = crmOrganizationSlice.reducer;
export const CrmOrganizationActions = crmOrganizationSlice.actions;
