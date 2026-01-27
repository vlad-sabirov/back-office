import { CrmContactResponse } from '@interfaces/crm';
import { UseFormReturnType } from '@mantine/form';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type FindContactT = {
	setModalVisible: (value: boolean) => void;
	setTitle: (value: string) => void;
	setFoundContacts: (value: CrmContactResponse[]) => void;
	hasContactIds: string[];
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

type FormValues = {
	name: string;
	phone: string;
}
export type FormValuesT = FormValues;
export type FormItemT = {
	form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
	className?: string;
}
