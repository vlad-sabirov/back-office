import { IReducer } from './slice.types';
import { format } from 'date-fns';
import { WritableDraft } from 'immer/dist/internal';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Const } from '../config/const';

const initialState: IReducer = {
	isLoading: false,
	isFetching: false,
	reloadTimestamp: '42',
	config: {
		organizationID: [],
		contactID: [],
	},
};

const Slice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setIsLoading: (state: WritableDraft<IReducer>, { payload }: PayloadAction<boolean>): void => {
			state.isLoading = payload;
		},
		setIsFetching: (state: WritableDraft<IReducer>, { payload }: PayloadAction<boolean>): void => {
			state.isFetching = payload;
		},
		reloadTimestamp: (state: WritableDraft<IReducer>): void => {
			state.reloadTimestamp = format(new Date(), 'T');
		},
		setConfigOrganizationIDs: (
			state: WritableDraft<IReducer>,
			{ payload }: PayloadAction<(number | string)[]>
		): void => {
			state.config.organizationID = payload;
		},
		setConfigContactIDs: (
			state: WritableDraft<IReducer>,
			{ payload }: PayloadAction<(number | string)[]>
		): void => {
			state.config.contactID = payload;
		},
	},
});

export const Reducer = Slice.reducer;
export const Actions = Slice.actions;
