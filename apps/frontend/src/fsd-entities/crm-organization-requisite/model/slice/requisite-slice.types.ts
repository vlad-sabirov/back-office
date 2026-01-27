import { PayloadAction } from '@reduxjs/toolkit';

export interface IRequisiteSliceInitialState {
	loading: boolean;
	current: IRequisiteSliceFormEntity | null;
	form: IRequisiteSliceForm;
	error: IRequisiteSliceError;
	modals: IRequisiteSliceModal;
}

export interface IRequisiteSliceModal {
	create: boolean;
	update: boolean;
	delete: boolean;
}

export interface IRequisiteSliceForm {
	create: Omit<IRequisiteSliceFormEntity, 'id'>;
	update: IRequisiteSliceFormEntity;
}

export interface IRequisiteSliceError {
	create: Partial<Record<keyof Omit<IRequisiteSliceFormEntity, 'id'>, string | undefined>>;
	update: Partial<Record<keyof IRequisiteSliceFormEntity, string | undefined>>;
}

export interface IRequisiteSliceFormEntity {
	id: string | null;
	type: 'created' | 'connected' | null;
	name: string;
	inn?: string;
	code1c: string;
}

export type IRequisiteSliceReducerSetCurrent = PayloadAction<IRequisiteSliceFormEntity | null>;

export type IRequisiteSliceReducerSetModal = PayloadAction<[keyof IRequisiteSliceModal, boolean]>;

export type IRequisiteSliceReducerSetFormAdd = PayloadAction<{
	[key in keyof IRequisiteSliceForm['create']]?: IRequisiteSliceForm['create'][key];
}>;

export type IRequisiteSliceReducerSetErrorAdd = PayloadAction<{
	[key in keyof IRequisiteSliceError['create']]?: IRequisiteSliceError['create'][key];
}>;

export type IRequisiteSliceReducerSetFormUpdate = PayloadAction<{
	[key in keyof IRequisiteSliceForm['update']]?: IRequisiteSliceForm['update'][key];
}>;

export type IRequisiteSliceReducerSetErrorUpdate = PayloadAction<{
	[key in keyof IRequisiteSliceError['update']]?: IRequisiteSliceError['update'][key];
}>;
