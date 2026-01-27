import { ICrmOrganizationEntity } from "@fsd/entities/crm-organization";
import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { ISliceInitialState } from "../org-card-info.slice.types";

export const setFindData = (
	state: WritableDraft<ISliceInitialState>,
	action: PayloadAction<ICrmOrganizationEntity[]>
): void => {
	state.find.data = action.payload;
}
