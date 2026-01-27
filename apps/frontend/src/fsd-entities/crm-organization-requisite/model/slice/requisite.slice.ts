import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Const } from "../../config/const";
import { initialState } from "./requisite-slice.init";

import {
	IRequisiteSliceReducerSetCurrent,
	IRequisiteSliceReducerSetErrorAdd, IRequisiteSliceReducerSetErrorUpdate,
	IRequisiteSliceReducerSetFormAdd, IRequisiteSliceReducerSetFormUpdate,
	IRequisiteSliceReducerSetModal
} from "./requisite-slice.types";

const requisiteSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setLoading: (state, payload: PayloadAction<boolean>) => {
			state.loading = payload.payload;
		},
		setCurrent: (state, payload: IRequisiteSliceReducerSetCurrent) => {
			state.current = payload.payload;
		},
		setModal: (state, payload: IRequisiteSliceReducerSetModal) => {
			state.modals[payload.payload[0]] = payload.payload[1];
		},
		setFormCreate: (state, payload: IRequisiteSliceReducerSetFormAdd) => {
			state.form.create = { ...state.form.create, ...payload.payload };
		},
		setErrorCreate: (state, payload: IRequisiteSliceReducerSetErrorAdd) => {
			state.error.create = { ...state.error.create, ...payload.payload };
		},
		setClearFormCreate: (state) => {
			state.form.create = initialState.form.create;
			state.error.create = initialState.error.create;
		},
		setFormUpdate: (state, payload: IRequisiteSliceReducerSetFormUpdate) => {
			state.form.update = { ...state.form.update, ...payload.payload };
		},
		setErrorUpdate: (state, payload: IRequisiteSliceReducerSetErrorUpdate) => {
			state.error.update = { ...state.error.update, ...payload.payload };
		},
		setClearFormUpdate: (state) => {
			state.form.update = initialState.form.update;
			state.error.update = initialState.error.update;
		},
	}
});

export const RequisiteReducer = requisiteSlice.reducer;
export const RequisiteActions = requisiteSlice.actions;
