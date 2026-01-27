import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IReducer } from "../search-model.types";

export const setIsShowModal = (
	state: WritableDraft<IReducer>,
	action: PayloadAction<boolean>
): void => {
	state.isShowModal = action.payload;
}
