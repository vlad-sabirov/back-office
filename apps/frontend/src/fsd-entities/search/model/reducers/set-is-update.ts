import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IReducer } from "../search-model.types";

export const setIsUpdate = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<boolean>
): void => {
	state.isUpdate = action.payload;
}
