import { createSlice } from "@reduxjs/toolkit";
import { Const } from "../config/const";
import { IReducer } from "./search-model.types";
import * as reducers from "./reducers";

const initialState: IReducer = {
	value: '',
	isShowModal: false,
	isLoading: false,
	isUpdate: false,
}

const slice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setIsLoading: reducers.setIsLoading,
		setIsShowModal: reducers.setIsShowModal,
		setIsUpdate: reducers.setIsUpdate,
		setValue: reducers.setValue,
	}
});

export const Reducer = slice.reducer
export const Actions = slice.actions
