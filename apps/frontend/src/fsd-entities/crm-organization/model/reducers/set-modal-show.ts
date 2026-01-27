import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";

import {
	ICrmOrganizationReducer,
	ICrmOrganizationReducerModals
} from "../slice.types";

export const setModalShow = (
	state: WritableDraft<ICrmOrganizationReducer>,
	action: PayloadAction<{ modal: keyof ICrmOrganizationReducerModals, show: boolean }>
): void => {
	state.modals[action.payload.modal] = action.payload.show;
}
