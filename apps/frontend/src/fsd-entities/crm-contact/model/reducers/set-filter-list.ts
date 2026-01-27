import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ICrmContactReducer, ICrmContactReducerFilterList } from "../slice.types";

export const setFilterList = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<ICrmContactReducerFilterList>
): void => {
	state.filter.list = action.payload;
}
