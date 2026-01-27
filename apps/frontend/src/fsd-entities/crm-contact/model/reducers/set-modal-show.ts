import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";

import { ICrmContactReducer, ICrmContactReducerModals } from "../slice.types";

export const setModalShow = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<{ modal: keyof ICrmContactReducerModals, show: boolean }>
): void => {
	state.modals[action.payload.modal] = action.payload.show;
}
