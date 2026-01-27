import { FormProps } from '..';

export type ContactsProps = FormProps;
export type ContactsValidateProps = Pick<FormProps, 'form'>;
export type ContactsModalsProps = {
	add: boolean;
	update: boolean;
	delete: boolean;
	disconnect: boolean;
}
export type ContactItemT = {
	id: string;
	type: 'create' | 'connect';
	name: string;
	workPosition: string;
	phones: { value: string; comment: string }[];
	emails: { value: string; comment: string }[];
	birthday: string;
	comment: string;
}
