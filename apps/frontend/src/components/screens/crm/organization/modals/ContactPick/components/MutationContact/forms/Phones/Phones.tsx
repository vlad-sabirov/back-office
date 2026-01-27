import { FC } from 'react';
import { Input, TextField } from '@fsd/shared/ui-kit';
import { phonesValidate, PHONES_CONSTANTS } from '.';
import * as Types from './phones.types';
import css from './phones.module.scss';

export const Phones: FC<Types.PhonesT> = ({ form, hasPhoneData }) => {

	const handleAddInput = () => {
		form.setFieldValue('phones', [
			...form.values.phones,
			{ value: '', comment: '' }
		]);
	};	

	return (
		<div className={css.wrapper}>
			<div className={css.label}>
				<TextField
					size={'small'}
				> Телефоны </TextField>

				<TextField
					size={'small'}
					className={css.add}
					onClick={handleAddInput}
				> Добавить </TextField>
			</div>

			{form.values.phones.map((_, index) => {
				return (
					<div key={index} className={css.item}>
						<Input
							mode={'phone'}
							{...form.getInputProps(`${PHONES_CONSTANTS.FIELD_NAME}.${index}.value`)}
							onBlur={() => phonesValidate({ form, hasPhoneData })}
						/>

						<Input
							placeholder={'Комментарий...'}
							{...form.getInputProps(`${PHONES_CONSTANTS.FIELD_NAME}.${index}.comment`)}
							onBlur={() => phonesValidate({ form, hasPhoneData })}
						/>
					</div>
				);
			})}
		</div>
	);
};
