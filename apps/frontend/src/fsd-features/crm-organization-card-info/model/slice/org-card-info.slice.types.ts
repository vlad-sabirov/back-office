import { ICrmEmailFormEntity } from '@fsd/entities/crm-email';
import { ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';
import { PayloadAction } from '@reduxjs/toolkit';

export interface IInitialState {
	isLoading: boolean;
	modals: IInitModals;
	forms: IInitForms;
	errors: IInitErrors;
}

/* ------ */
/* Modals */
/* ------ */
export interface IInitModals {
	changeUserId: boolean;
	updateOrganization: boolean;
	toArchive: boolean;
	toVerified: boolean;
	toFreedom: boolean;
	toPriority: boolean;
	fromArchive: boolean;
}
export type IReducerModalOpen = PayloadAction<[keyof IInitModals, boolean]>;

/* ----------- */
/* Form values */
/* ----------- */
export interface IInitForms {
	changeUserId: IInitFormChangeUserId;
	updateOrganization: IInitFormUpdateOrganization;
}
export interface IInitFormChangeUserId {
	userId: string;
}
export type IReducerFormChangeUserId = PayloadAction<{
	[key in keyof IInitFormChangeUserId]: string;
}>;
export interface IInitFormUpdateOrganization {
	nameRu: string;
	nameEn: string;
	userId: string;
	typeId: string;
	phones: ICrmPhoneFormEntity[];
	emails: ICrmEmailFormEntity[];
	website: string;
	tags: string[];
	comment: string;
	color: string;
}
export type IReducerFormUpdateOrganization = PayloadAction<{
	[key in keyof IInitFormUpdateOrganization]?: IInitFormUpdateOrganization[key];
}>;

/* ----------- */
/* Form errors */
/* ----------- */
export type IInitErrors = {
	changeUserId: IInitErrorChangeUserId;
	updateOrganization: IInitErrorUpdateOrganization;
};
export type IInitErrorChangeUserId = {
	[key in keyof IInitFormChangeUserId]?: string | undefined;
};
export type IReducerErrorChangeUserId = PayloadAction<{
	[key in keyof IInitErrorChangeUserId]: string | undefined;
}>;
export type IInitErrorUpdateOrganization = {
	[key in keyof IInitFormUpdateOrganization]?: IInitFormUpdateOrganization[key] extends string[]
		? string
		: IInitFormUpdateOrganization[key] extends object
		? Record<number, string>
		: string;
};
export type IReducerErrorUpdateOrganization = PayloadAction<IInitErrorUpdateOrganization>;
