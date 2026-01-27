import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ICrmOrganizationTypeEntity } from "../../types/crm-organization-type.entity";
import { ICrmOrganizationTypeReducer } from "../../types/crm-organization-type.reducer";

export const setDataList = (
	state: WritableDraft<ICrmOrganizationTypeReducer>,
	action: PayloadAction<ICrmOrganizationTypeEntity[]>
): void => {
	state.data.list = action.payload;
}
