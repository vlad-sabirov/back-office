import { UseFormReturnType } from '@mantine/form';
import { OrganizationAddDrawerFormFieldsProps } from '../';
import { emailsValidate } from './Emails';
import { firstDocumentValidate } from './FirstDocument';
import { nameValidate } from './Name';
import { phonesValidate } from './Phones';
import { requisitesValidate } from './Requisites';
import { typeValidate } from './Type';
import { userValidate } from './User';
import { websiteValidate } from './Website';

type TypeT = OrganizationAddDrawerFormFieldsProps;
export type FormProps = {
	form: UseFormReturnType<TypeT, (values: TypeT) => TypeT>
	className?: string;
}

export const validateAll = async (
	{ form }: { form: UseFormReturnType<TypeT, (values: TypeT) => TypeT> }
): Promise<true | undefined> => {
	const isValidate = 
		!(await nameValidate({ form }))
		|| !(await firstDocumentValidate({ form }))
		|| !(await userValidate({ form }))
		|| !(await typeValidate({ form }))
		|| !(await websiteValidate({ form }))
		|| !(await phonesValidate({ form }))
		|| !(await emailsValidate({ form }))
		|| !(await requisitesValidate({ form }))

	if (isValidate) return;
	return true;
}

export * from './Comment';
export * from './Emails';
export * from './FirstDocument';
export * from './Name';
export * from './Contacts';
export * from './Phones';
export * from './Requisites';
export * from './Tags';
export * from './Type';
export * from './User';
export * from './Website';
