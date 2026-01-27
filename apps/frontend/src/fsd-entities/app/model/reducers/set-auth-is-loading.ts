import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IAppReducer } from "../app.types";

export const setAuthIsLoading = (
	state: WritableDraft<IAppReducer>,
	action: PayloadAction<boolean>
): void => {
	state.auth.isLoading = action.payload;
}
