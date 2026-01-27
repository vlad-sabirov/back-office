import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { UseFormReturnType } from '@mantine/form';

export type OrganizationAddDrawerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type FormOrganizationT = {
	name: string;
	firstDocument: string;
	website: string;
	comment: string;
	userId: string;
	typeId: string;
};

export type FormPhoneT = {
	value: string;
	comment: string;
};

export type FormEmailT = {
	value: string;
	comment: string;
};

export type FormRequisiteT = {
	index: string;
	name: string;
	inn: string;
	code1c: string;
};

export type FormContactT = {
	id: string;
	type: 'create' | 'connect';
	name: string;
	workPosition: string;
	phones: FormPhoneT[];
	emails: FormEmailT[];
	birthday: string | null;
	comment: string;
};

export type OrganizationAddDrawerFormFieldsProps = {
	organization: FormOrganizationT;
	phones: FormPhoneT[];
	emails: FormEmailT[];
	requisites: FormRequisiteT[];
	contacts: FormContactT[];
	tags: string[];
};
type FormT = OrganizationAddDrawerFormFieldsProps;
export type OrganizationAddDrawerFormProps = UseFormReturnType<FormT, (values: FormT) => FormT>;

export type OrganizationAddDrawerFetchClean = {
	organization: number | null;
	phones: number[];
	emails: number[];
	requisites: number[];
	contacts: [number, 'create' | 'connect'][];
};
