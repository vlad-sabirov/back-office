import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";

import {
	ICrmOrganizationTypeReducer,
	ICrmOrganizationTypeReducerModals
} from "../../types/crm-organization-type.reducer";

export const setModalShow = (
	state: WritableDraft<ICrmOrganizationTypeReducer>,
	action: PayloadAction<{ modal: keyof ICrmOrganizationTypeReducerModals, show: boolean }>
): void => {
	state.modals[action.payload.modal] = action.payload.show;
}
