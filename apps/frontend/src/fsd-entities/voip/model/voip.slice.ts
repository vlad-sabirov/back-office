import { IVoipConfig, IVoipEvent, IVoipMissed, IVoipRefresh } from './voip-slice-init.types';
import { initialState } from './voip-slice.init';
import { format } from 'date-fns';
import { merge } from 'lodash';
import { DeepPartial, PayloadAction, createSlice } from '@reduxjs/toolkit';

const voipSlice = createSlice({
	name: 'voip',
	initialState,
	reducers: {
		setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.isLoading = payload;
		},
		setIsFetching: (state, { payload }: PayloadAction<boolean>) => {
			state.isFetching = payload;
		},
		setConfig: (state, { payload }: PayloadAction<DeepPartial<IVoipConfig>>) => {
			state.config = merge(state.config, payload);
		},
		refresh: (state, { payload }: PayloadAction<keyof IVoipRefresh>) => {
			state.refresh[payload] = format(new Date(), 'T');
		},
		setDataMy: (state, { payload }: PayloadAction<IVoipEvent | null>) => {
			state.data.my = payload;
		},
		setDataMissed: (state, { payload }: PayloadAction<IVoipMissed[]>) => {
			state.data.missed = payload;
		},
		setDataEvents: (state, { payload }: PayloadAction<IVoipEvent[]>) => {
			state.data.events = payload;
		},
		setCallModalUUID: (state, { payload }: PayloadAction<string>) => {
			state.callModal.uuid = payload;
		},
		setCallModalIsShow: (state, { payload }: PayloadAction<boolean>) => {
			state.callModal.isShowModal = payload;
		},
	},
});

export const VoipSliceReducer = voipSlice.reducer;
export const VoipSliceActions = voipSlice.actions;
