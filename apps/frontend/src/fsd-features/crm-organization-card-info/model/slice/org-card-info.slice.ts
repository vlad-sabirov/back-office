import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Const } from "../../config/const";
import { initialState } from "./org-card-info.init";
import {
	IReducerErrorChangeUserId, IReducerErrorUpdateOrganization,
	IReducerFormChangeUserId, IReducerFormUpdateOrganization,
	IReducerModalOpen
} from "./org-card-info.slice.types";

const orgCardInfoSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.isLoading = payload;
		},
		setModal: (state, { payload }: IReducerModalOpen) => {
			state.modals[payload[0]] = payload[1];
		},
		setFormChangeUserId: (state, { payload }: IReducerFormChangeUserId) => {
			state.forms.changeUserId = { ...state.forms.changeUserId, ...payload };
		},
		setErrorChangeUserId: (state, { payload }: IReducerErrorChangeUserId) => {
			state.errors.changeUserId = { ...state.errors.changeUserId, ...payload };
		},
		clearErrorChangeUserId: (state) => {
			state.errors.changeUserId = {};
		},
		setFormUpdateOrganization: (state, { payload }: IReducerFormUpdateOrganization) => {
			state.forms.updateOrganization = { ...state.forms.updateOrganization, ...payload };
		},
		setErrorUpdateOrganization: (state, { payload }: IReducerErrorUpdateOrganization) => {
			state.errors.updateOrganization = { ...state.errors.updateOrganization, ...payload };
		},
		clearErrorUpdateOrganization: (state) => {
			state.errors.updateOrganization = {};
		},
	}
})

export const OrgCardInfoReducer = orgCardInfoSlice.reducer;
export const OrgCardInfoActions = orgCardInfoSlice.actions;
