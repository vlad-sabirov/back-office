import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { NameProps, nameValidate, NAME_CONSTANTS } from '.';

export const Name: FC<NameProps> = ({ form, hasData, className }) => {
	return (
		<Input
			label={'Название контрагента'}
			{...form.getInputProps(NAME_CONSTANTS.FIELD_NAME)}
			onBlur={() => {
				form.setFieldValue(
					NAME_CONSTANTS.FIELD_NAME,
					form.values.name.trim()
				);
				nameValidate({ form, hasData })
			}}
			className={className}
			required
		/>
	);
};
