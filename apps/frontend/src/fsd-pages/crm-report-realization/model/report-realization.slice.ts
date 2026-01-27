import { initialState } from './initial';
import { IInitialStateModals } from './initial.types';
import { IInitialStateErrorPlanCreate, IInitialStateFormPlanCreate } from './initial.types';
import { IInitialStateErrorPlanUpdate, IInitialStateFormPlanUpdate } from './initial.types';
import { merge } from 'lodash';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const reportRealizationSlice = createSlice({
	name: 'crm_realization_page',
	initialState,
	reducers: {
		setIsFetching: (state, { payload }: PayloadAction<boolean>) => {
			state.isFetching = payload;
		},
		setModal: (state, { payload }: PayloadAction<[keyof IInitialStateModals, boolean]>) => {
			state.modals[payload[0]] = payload[1];
		},
		setFormPlanCreate: (
			state,
			{
				payload,
			}: PayloadAction<{
				[key in keyof IInitialStateFormPlanCreate]: IInitialStateFormPlanCreate[key];
			}>
		) => {
			state.forms.planCreate = merge(state.forms.planCreate, payload);
		},
		setErrorPlanCreate: (
			state,
			{
				payload,
			}: PayloadAction<{
				[key in keyof IInitialStateErrorPlanCreate]?: IInitialStateErrorPlanCreate[key];
			}>
		) => {
			state.errors.planCreate = merge(state.errors.planCreate, payload);
		},
		setFormPlanUpdate: (
			state,
			{
				payload,
			}: PayloadAction<{
				[key in keyof IInitialStateFormPlanUpdate]: IInitialStateFormPlanUpdate[key];
			}>
		) => {
			state.forms.planUpdate = merge(state.forms.planUpdate, payload);
		},
		setErrorPlanUpdate: (
			state,
			{
				payload,
			}: PayloadAction<{
				[key in keyof IInitialStateErrorPlanUpdate]?: IInitialStateErrorPlanUpdate[key];
			}>
		) => {
			state.errors.planUpdate = merge(state.errors.planUpdate, payload);
		},
		setClearPlanCreate: (state) => {
			state.forms.planCreate = initialState.forms.planCreate;
			state.errors.planCreate = initialState.errors.planCreate;
		},
		setClearPlanUpdate: (state) => {
			state.forms.planUpdate = initialState.forms.planUpdate;
			state.errors.planUpdate = initialState.errors.planUpdate;
		},
	},
});

export const ReportRealizationSliceReducer = reportRealizationSlice.reducer;
export const ReportRealizationSliceActions = reportRealizationSlice.actions;
