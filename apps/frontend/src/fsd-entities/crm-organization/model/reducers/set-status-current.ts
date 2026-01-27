import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { FetchStatus } from "@fsd/shared/lib/fetch-status";
import { ICrmOrganizationReducer } from "../slice.types";

export const setStatusCurrent = (
	state: WritableDraft<ICrmOrganizationReducer>,
	action: PayloadAction<typeof FetchStatus[number]>
): void => {
	state.status.current = action.payload;
}
