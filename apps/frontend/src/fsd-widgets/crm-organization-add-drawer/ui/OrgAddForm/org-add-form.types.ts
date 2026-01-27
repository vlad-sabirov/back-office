import { ICrmPhoneFormEntity } from "@fsd/entities/crm-phone";
import { ICrmEmailFormEntity } from "@fsd/entities/crm-email";
import { IOrgAddInitialStateForm } from '../../model/slice/org-add.types';

export interface IHandleSetValue {
	field: keyof IOrgAddInitialStateForm;
	value: string;
}

export interface IHandleSetPhonesValue {
	value: ICrmPhoneFormEntity[];
}

export interface IHandleSetEmailsValue {
	value: ICrmEmailFormEntity[];
}

export interface IHandleSetError {
	field: keyof IOrgAddInitialStateForm;
	value: string | undefined;
}

export interface IHandleSetManyError {
	field: keyof IOrgAddInitialStateForm;
	value: Record<number, string> | undefined;
}
