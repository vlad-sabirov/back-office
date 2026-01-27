import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { nameValidate, NAME_CONSTANTS } from '.';
import * as Types from './name.types';

export const Name: FC<Types.NameT> = ({ form, className }) => {
	return (
		<Input
			label={'ФИО'}
			{...form.getInputProps(NAME_CONSTANTS.FIELD_NAME)}
			onBlur={() => nameValidate({ form })}
			className={className}
		/>
	);
};
