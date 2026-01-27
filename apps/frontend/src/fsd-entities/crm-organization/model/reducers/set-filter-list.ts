import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ICrmOrganizationReducer, ICrmOrganizationReducerFilterList } from "../slice.types";

export const setFilterList = (
	state: WritableDraft<ICrmOrganizationReducer>,
	action: PayloadAction<ICrmOrganizationReducerFilterList>
): void => {
	state.filter.list = action.payload;
}
