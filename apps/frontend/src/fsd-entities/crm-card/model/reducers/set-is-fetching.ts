import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IReducer } from "../crm-model.types";

export const setIsFetching = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<boolean>
): void => {
	state.isFetching = action.payload;
}
