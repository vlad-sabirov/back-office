import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState, ISliceInitialStateModals } from "../org-card-info.slice.types";

export const setShowModal = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<[keyof ISliceInitialStateModals,  boolean]>
): void => {
	state.isShowModals[action.payload[0]] = action.payload[1];
}
