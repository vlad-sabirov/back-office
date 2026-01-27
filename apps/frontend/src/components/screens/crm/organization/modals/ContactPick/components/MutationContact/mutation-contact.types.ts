import { UseFormReturnType } from '@mantine/form';
import { FormEmailT, FormPhoneT } from '@screens/crm/organization/drawers';
import { ContactItemT } from '@screens/crm/organization/drawers/OrganizationAdd/forms';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type MutationContactT = {
	type: 'create' | 'update';
	current?: ContactItemT;
	onSuccess: (response: ContactItemT) => void;
	setModalVisible: (value: boolean) => void;
	setTitle: (value: string) => void;
	hasPhoneData: FormPhoneT[];
	hasEmailData: FormEmailT[];
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

type FormValues = {
	name: string;
	workPosition: string;
	phones: { value: string; comment: string }[];
	emails: { value: string; comment: string }[];
	birthday: string;
	comment: string;
}
export type FormValuesT = FormValues;
export type FormItemT = {
	form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
	hasPhoneData?: FormPhoneT[];
	hasEmailData?: FormEmailT[];
	className?: string;
}
