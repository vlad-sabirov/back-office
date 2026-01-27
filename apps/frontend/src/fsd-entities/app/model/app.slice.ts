import { createSlice } from "@reduxjs/toolkit";
import { Const } from "../const";
import * as reducers from "./reducers";
import { IAppReducer } from "./app.types";

const initialState: IAppReducer = {
	auth: {
		isLoading: true,
		isAuth: false,
		isFired: false,
		userId: null,
		parentId: null,
		firstName: null,
		lastName: null,
		color: null,
		photo: null,
		team: null,
		roles: null,
		username: null,
		password: null,
		phone: {
			voip: null,
			mobile: null,
		},
		step: 1,
		pinCode: null,
		hard: false,
	}
}

const appSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setAuthData: reducers.setAuthData,
		setAuthIsLoading: reducers.setAuthIsLoading,
		setAuth: reducers.setAuth,
	}
});

export const AppReducer = appSlice.reducer
export const AppActions = appSlice.actions
