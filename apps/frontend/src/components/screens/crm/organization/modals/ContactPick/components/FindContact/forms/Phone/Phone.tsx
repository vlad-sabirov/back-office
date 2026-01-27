import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { phoneValidate, PHONE_CONSTANTS } from '.';
import * as Types from './phone.types';

export const Phone: FC<Types.PhoneT> = ({ form, className }) => {
	return (
		<Input
			label={'Телефон'}
			mode={'phone'}
			{...form.getInputProps(PHONE_CONSTANTS.FIELD_NAME)}
			onBlur={() => phoneValidate({ form })}
			className={className}
		/>
	);
};
