import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState } from "../org-card-info.slice.types";

export const setIsLoading = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<boolean>
): void => {
	state.isLoading = action.payload;
}
