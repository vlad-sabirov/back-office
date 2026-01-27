import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState, ISliceInitialStateFormFind } from "../org-card-info.slice.types";

export const setFindForm = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<[keyof ISliceInitialStateFormFind,  string]>
): void => {
	state.find.form[action.payload[0]] = action.payload[1];
}
