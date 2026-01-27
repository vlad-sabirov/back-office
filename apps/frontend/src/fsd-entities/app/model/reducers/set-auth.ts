import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IAppReducer } from "../app.types";

export const setAuth = (
	state: WritableDraft<IAppReducer>,
	action: PayloadAction<boolean>
): void => {
	state.auth.isAuth = action.payload;
}
