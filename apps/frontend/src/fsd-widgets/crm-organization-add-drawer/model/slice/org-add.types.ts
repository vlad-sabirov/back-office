import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { ICrmEmailFormEntity } from '@fsd/entities/crm-email';
import { ICrmOrganizationRequisiteFormEntity } from '@fsd/entities/crm-organization-requisite';
import { ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';
import { PayloadAction } from '@reduxjs/toolkit';

export interface IOrgAddInitialState {
	values: IOrgAddInitialStateForm;
	errors: Partial<Record<keyof IOrgAddInitialStateForm, string | Record<number, string>>>;
	isShow: boolean;
	isLoading: boolean;
}

export type ISetValues = {
	[key in keyof IOrgAddInitialStateForm]?: IOrgAddInitialStateForm[key];
};

export type IContactCardReducerSetUpdateError = PayloadAction<{
	[key in keyof IOrgAddInitialStateForm]?: IOrgAddInitialStateForm[key] extends object
		? Record<string, string>
		: string;
}>;

export interface IOrgAddInitialStateForm {
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website: string;
	comment: string;
	userId: number | string;
	typeId: number | string;

	phones: ICrmPhoneFormEntity[];
	emails: ICrmEmailFormEntity[];
	tags: string[];
	requisites: ICrmOrganizationRequisiteFormEntity[];
	contacts: ICrmContactFormEntity[];

	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
}
