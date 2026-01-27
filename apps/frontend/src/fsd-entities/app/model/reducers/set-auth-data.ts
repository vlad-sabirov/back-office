import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IAppReducer } from "../app.types";

export const setAuthData = (
	state: WritableDraft<IAppReducer>,
	action: PayloadAction<Omit<IAppReducer['auth'], 'isAuth' | 'isLoading'> | null>
): void => {
	state.auth.isFired = action.payload === null ? false : action.payload.isFired;
	state.auth.userId = action.payload === null ? null : action.payload.userId;
	state.auth.parentId = action.payload === null ? null : action.payload.parentId;
	state.auth.lastName = action.payload === null ? null : action.payload.lastName;
	state.auth.firstName = action.payload === null ? null : action.payload.firstName;
	state.auth.color = action.payload === null ? null : action.payload.color;
	state.auth.photo = action.payload === null ? null : action.payload.photo;
	state.auth.team = action.payload === null ? null : action.payload.team;
	state.auth.roles = action.payload === null ? null : action.payload.roles;
	state.auth.username = action.payload === null ? null : action.payload.username;
	state.auth.password = action.payload === null ? null : action.payload.password;
	state.auth.phone.mobile = action.payload === null ? null : action.payload.phone.mobile;
	state.auth.phone.voip = action.payload === null ? null : action.payload.phone.voip;
	state.auth.step = action.payload === null ? 1 : action.payload.step;
	state.auth.pinCode = action.payload === null ? 0 : action.payload.pinCode;
	state.auth.hard = action.payload === null ? false : action.payload.hard;
}
