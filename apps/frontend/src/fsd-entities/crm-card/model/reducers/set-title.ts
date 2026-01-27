import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IReducer } from "../crm-model.types";

export const setTitle = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<string | null>
): void => {
	state.title = action.payload;
}
