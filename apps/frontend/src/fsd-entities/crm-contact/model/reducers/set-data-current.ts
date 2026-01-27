import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ICrmContactEntity } from "../../entity";
import { ICrmContactReducer } from "../slice.types";

export const setDataCurrent = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<ICrmContactEntity | null>
): void => {
	state.data.current = action.payload;
}
