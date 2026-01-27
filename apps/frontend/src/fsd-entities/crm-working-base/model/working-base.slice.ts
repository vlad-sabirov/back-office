import { initialState } from './working-base-slice.init';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IWorkingBaseRes } from '../api/res';

const workingBaseSlice = createSlice({
	name: 'crm_working_base',
	initialState,
	reducers: {
		setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.isLoading = payload;
		},
		setIsFetching: (state, { payload }: PayloadAction<boolean>) => {
			state.isFetching = payload;
		},
		setDataAll: (state, { payload }: PayloadAction<Record<string, IWorkingBaseRes>>) => {
			state.data.all = payload;
		},
		setDataAllLast: (state, { payload }: PayloadAction<IWorkingBaseRes | null>) => {
			state.data.allLast = payload;
		},
	},
});

export const WorkingBaseSliceReducer = workingBaseSlice.reducer;
export const WorkingBaseSliceActions = workingBaseSlice.actions;
