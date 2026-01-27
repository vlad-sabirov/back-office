import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState } from "../org-card-info.slice.types";

export const setDisconnectCurrentId = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<string | number | null>
): void => {
	state.disconnect.currentId = action.payload;
}
