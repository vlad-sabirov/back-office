import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IReducer } from "../search-model.types";

export const setValue = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<string>
): void => {
	state.value = action.payload;
}
