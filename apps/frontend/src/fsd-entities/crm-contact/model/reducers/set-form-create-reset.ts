import { WritableDraft } from "immer/dist/internal";
import { initialState } from "../slice";
import { ICrmContactReducer } from "../slice.types";

export const setFormCreateReset = (
	state: WritableDraft<ICrmContactReducer>,
): void => {
	state.forms.create = initialState.forms.create;
}
