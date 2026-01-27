import { UseFormReturnType } from '@mantine/form';
import { RequisiteAddFormT } from '../requisite-add-modal.props';
import { innValidate } from './Inn';
import { nameValidate } from './Name';

type TypeT = RequisiteAddFormT;
export type FormProps = {
	form: UseFormReturnType<TypeT, (values: TypeT) => TypeT>
	className?: string;
}

export const validateAll = async ( 
	{ form, hasData }:
	{ form: UseFormReturnType<TypeT, (values: TypeT) => TypeT>, hasData?: TypeT[]; }
): Promise<true | undefined> => {
	const isValidate = 
		!(await nameValidate({ form, hasData }))
		|| !(await innValidate({ form, hasData }))
	
	if (isValidate) return;
	return true;
}

export * from './Name';
export * from './Inn';
