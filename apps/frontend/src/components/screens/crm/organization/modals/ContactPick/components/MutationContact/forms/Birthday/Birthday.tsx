import { FC } from 'react';
import { DatePicker } from '@fsd/shared/ui-kit';
import { birthdayValidate, BIRTHDAY_CONSTANTS } from '.';
import * as Types from './birthday.types';
import { format, parse } from 'date-fns';

export const Birthday: FC<Types.BirthdayT> = ({ form, className }) => {
	return (
		<DatePicker
			label={'День рождения'}
			{...form.getInputProps(BIRTHDAY_CONSTANTS.FIELD_NAME)}
			value={
				form.values.birthday 
				? parse(form.values.birthday, 'yyyy-MM-dd', new Date())
				: null
			}
			onChange={(value) => {
				const formattedValue = value ? format(value, 'yyyy-MM-dd') : ''
				form.setFieldValue(BIRTHDAY_CONSTANTS.FIELD_NAME, formattedValue);
				birthdayValidate({
					form: { ...form, values: { ...form.values, birthday: formattedValue } }
				});
			}}
			className={className}
		/>
	);
};
