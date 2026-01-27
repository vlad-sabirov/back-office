import { ICrmContactEntity } from "@fsd/entities/crm-contact";
import { ICrmContactFormEntity } from "@fsd/entities/crm-contact/entity";
import { ICrmEmailFormEntity } from "@fsd/entities/crm-email";
import { ICrmPhoneFormEntity } from "@fsd/entities/crm-phone";
import { PayloadAction } from "@reduxjs/toolkit";

export interface IContactCardSliceInitialState {
	loading: boolean,
	searchStep: 'search' | 'create' | 'connect',
	modals: IContactCardSliceModals,
	forms: IContactCardSliceForms,
	errors: IContactCardSliceErrors,
	current: ICrmContactFormEntity | null,
	searchResult: ICrmContactEntity[],
}

export interface IContactCardSliceModals {
	search: boolean,
	create: boolean,
	update: boolean,
	delete: boolean,
	disconnect: boolean,
}

export type IContactCardReducerSetModal = PayloadAction<[keyof IContactCardSliceModals, boolean]>;
export type IContactCardReducerSetSearchForm = PayloadAction<{
	[key in keyof IContactCardSliceFormSearch]?: IContactCardSliceFormSearch[key];
}>;
export type IContactCardReducerSetCreateForm = PayloadAction<{
	[key in keyof IContactCardSliceFormCreate]?: IContactCardSliceFormCreate[key];
}>;
export type IContactCardReducerSetCreateError = PayloadAction<{
	[key in keyof IContactCardSliceFormCreate]?: IContactCardSliceFormCreate[key] extends object
		? Record<string, string>
		: string;
}>;
export type IContactCardReducerSetUpdateForm = PayloadAction<{
	[key in keyof IContactCardSliceFormUpdate]?: IContactCardSliceFormUpdate[key];
}>;
export type IContactCardReducerSetUpdateError = PayloadAction<{
	[key in keyof IContactCardSliceFormUpdate]?: IContactCardSliceFormUpdate[key] extends object
		? Record<string, string>
		: string;
}>;

export interface IContactCardSliceForms {
	search: IContactCardSliceFormSearch;
	create: IContactCardSliceFormCreate;
	update: IContactCardSliceFormUpdate;
}

export interface IContactCardSliceErrors {
	create: {
		[key in keyof IContactCardSliceFormCreate]?: IContactCardSliceFormCreate[key] extends object
			? Record<string, string>
			: string;
	};
	update: {
		[key in keyof IContactCardSliceFormUpdate]?: IContactCardSliceFormUpdate[key] extends object
			? Record<string, string>
			: string;
	};
}

export interface IContactCardSliceFormSearch {
	name: string;
	phone: string;
}

export interface IContactCardSliceFormCreate {
	name: string;
	workPosition: string;
	phones: ICrmPhoneFormEntity[];
	emails: ICrmEmailFormEntity[];
	birthday: string;
	userId: string;
	comment: string;
	type?: 'create' | 'connect';
}

export type IContactCardSliceFormUpdate = IContactCardSliceFormCreate;
