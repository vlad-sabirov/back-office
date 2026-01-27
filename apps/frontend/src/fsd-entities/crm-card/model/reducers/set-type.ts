import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { Types } from "../../config/enums";
import { IReducer } from "../crm-model.types";

export const setType = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<Types | null>
): void => {
	state.type = action.payload;
}
