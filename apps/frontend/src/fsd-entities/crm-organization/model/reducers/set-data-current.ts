import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ICrmOrganizationEntity } from "../../entity";
import { ICrmOrganizationReducer } from "../slice.types";

export const setDataCurrent = (
	state: WritableDraft<ICrmOrganizationReducer>,
	action: PayloadAction<ICrmOrganizationEntity | null>
): void => {
	state.data.current = action.payload;
}
