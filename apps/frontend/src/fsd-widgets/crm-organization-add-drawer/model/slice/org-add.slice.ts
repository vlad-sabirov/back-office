import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Const } from "../../config/const";
import { initialState } from "./org-add.init";
import { IContactCardReducerSetUpdateError, ISetValues } from "./org-add.types";

const orgAddSlice = createSlice({
	name: Const.State.Name,
	initialState: initialState,
	reducers: {
		setIsShow: (state, action: PayloadAction<boolean>) => {
			state.isShow = action.payload;
		},
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setValues: (state, action: PayloadAction<ISetValues>) => {
			state.values = { ...state.values, ...action.payload };
		},
		setErrors: (state, action: IContactCardReducerSetUpdateError) => {
			state.errors = { ...state.errors, ...action.payload };
		},
		clear: (state) => {
			state.errors = initialState.errors;
			state.values = initialState.values;
		},
	},
})

export const orgAddReducer = orgAddSlice.reducer;
export const orgAddActions = orgAddSlice.actions;
