import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IAddContactForm, ICrmContactReducer } from "../slice.types";

type IPayload<T extends IAddContactForm['values']> = keyof T extends infer Key
	? Key extends keyof T
		? { field: Key, value?: T[Key], error?: string }
		: never
	: never;

export const setFormEdit = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<IPayload<IAddContactForm['values']> | null>
): void => {
	if (action.payload === null) {
		state.forms.update = {
			values: {
				name: '',
				userId: '',
				workPosition: '',
				birthday: '',
				comment: '',
				phones: [{ value: '', comment: '' }],
				emails: [{ value: '', comment: '' }],
			},
			errors: {},
		};
		return;
	}

	const { field, value, error } = action.payload;
	
	if (typeof value !== 'undefined') {
		const valueItem = { [field]: value };
		state.forms.update.values = { ...state.forms.update.values, ...valueItem };
	}

	const errorItem = { [field]: error || undefined };
	state.forms.update.errors = { ...state.forms.update.errors, ...errorItem };
}
