import { initialState } from './realization-slice.init';
import { IRealizationInitialState } from '@fsd/entities/crm-realization/model/realization-slice-init.types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IMonthRes } from '../api/res';

const realizationSlice = createSlice({
	name: 'crm_realization',
	initialState,
	reducers: {
		setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.isLoading = payload;
		},
		setCurrentYear: (state, { payload }: PayloadAction<string>) => {
			state.currentYear = payload;
		},
		setCurrentMonth: (state, { payload }: PayloadAction<string>) => {
			state.currentMonth = payload;
		},
		setIsFetching: (state, { payload }: PayloadAction<boolean>) => {
			state.isFetching = payload;
		},
		setDataMonthAll: (state, { payload }: PayloadAction<IMonthRes[]>) => {
			state.data.monthAll = payload;
		},
		setType: (state, { payload }: PayloadAction<IRealizationInitialState['type']>) => {
			state.type = payload;
		},
	},
});

export const RealizationSliceReducer = realizationSlice.reducer;
export const RealizationSliceActions = realizationSlice.actions;
