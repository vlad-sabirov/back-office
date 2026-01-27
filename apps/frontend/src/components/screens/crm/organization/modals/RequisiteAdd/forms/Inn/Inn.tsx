import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { InnProps, innValidate, INN_CONSTANTS } from '.';

export const Inn: FC<InnProps> = ({ form, hasData, className }) => {	
	return (
		<Input
			label={'ИНН'}
			{...form.getInputProps(INN_CONSTANTS.FIELD_NAME)}
			onChange={(e) => {
				form.setFieldValue(INN_CONSTANTS.FIELD_NAME, e.target.value.replace(/\D/g, ''));
			}}
			onBlur={() => innValidate({ form, hasData })}
			className={className}
			required
		/>
	);
};
