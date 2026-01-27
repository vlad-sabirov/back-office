import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState, ISliceInitialStateFindStatus } from "../org-card-info.slice.types";

export const setFindStatus = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<ISliceInitialStateFindStatus>
): void => {
	state.find.status = action.payload;
}
