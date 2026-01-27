import { Input } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { FIELD_NAME_NAME, NameProps, nameValidate } from '.';

export const Name: FC<NameProps> = ({ form, className }) => {
	return (
		<Input
			label={'Название организации'}
			{...form.getInputProps(FIELD_NAME_NAME)}
			onBlur={() => nameValidate({ form })}
			className={className}
			required
		/>
	);
};
