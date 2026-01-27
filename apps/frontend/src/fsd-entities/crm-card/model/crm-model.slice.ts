import { createSlice } from "@reduxjs/toolkit";
import { Const } from "../config/const";
import { IReducer } from "./crm-model.types";
import * as reducers from "./reducers";

const initialState: IReducer = {
	isShow: false,
	isLoading: false,
	isFetching: false,
	isUpdate: false,
	status: null,
	title: null,
	type: null,
}

const slice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setIsLoading: reducers.setIsLoading,
		setIsFetching: reducers.setIsFetching,
		setIsShow: reducers.setIsShow,
		setIsUpdate: reducers.setIsUpdate,
		setStatus: reducers.setStatus,
		setTitle: reducers.setTitle,
		setType: reducers.setType,
	}
});

export const Reducer = slice.reducer
export const Actions = slice.actions
