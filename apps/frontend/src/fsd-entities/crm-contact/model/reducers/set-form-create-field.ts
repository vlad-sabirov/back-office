import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IAddContactForm, ICrmContactReducer } from "../slice.types";

type IPayload<T extends IAddContactForm['values']> = keyof T extends infer Key
	? Key extends keyof T
		? { field: Key, value?: T[Key], error?: string }
		: never
	: never;

export const setFormCreateField = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<IPayload<IAddContactForm['values']>>
): void => {
	const { field, value, error } = action.payload;
	
	if (typeof value !== 'undefined') {
		const valueItem = { [field]: value };
		state.forms.create.values = { ...state.forms.create.values, ...valueItem };
	}

	const errorItem = { [field]: error || undefined };
	state.forms.create.errors = { ...state.forms.create.errors, ...errorItem };
}
