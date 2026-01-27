import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { FetchStatus } from "@fsd/shared/lib/fetch-status";
import { ICrmOrganizationTypeReducer } from "../../types/crm-organization-type.reducer";

export const setStatusList = (
	state: WritableDraft<ICrmOrganizationTypeReducer>,
	action: PayloadAction<typeof FetchStatus[number]>
): void => {
	state.status.list = action.payload;
}
