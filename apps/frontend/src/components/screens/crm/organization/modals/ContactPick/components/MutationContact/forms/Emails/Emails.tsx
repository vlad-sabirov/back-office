import { FC } from 'react';
import { Input, TextField } from '@fsd/shared/ui-kit';
import { emailsValidate, EMAILS_CONSTANTS } from '.';
import * as Types from './emails.types';
import css from './emails.module.scss';

export const Emails: FC<Types.EmailsT> = ({ form, hasEmailData }) => {

	const handleAddInput = () => {
		form.setFieldValue('emails', [
			...form.values.emails,
			{ value: '', comment: '' }
		]);
	};

	return (
		<div className={css.wrapper}>
			<div className={css.label}>
				<TextField
					size={'small'}
				> Почта </TextField>

				<TextField
					size={'small'}
					className={css.add}
					onClick={handleAddInput}
				> Добавить </TextField>
			</div>

			{form.values.emails.map((_, index) => {
				return (
					<div key={index} className={css.item}>
						<Input
							mode={'email'}
							{...form.getInputProps(`${EMAILS_CONSTANTS.FIELD_NAME}.${index}.value`)}
							onBlur={() => emailsValidate({ form, hasEmailData })}
						/>

						<Input
							placeholder={'Комментарий...'}
							{...form.getInputProps(`${EMAILS_CONSTANTS.FIELD_NAME}.${index}.comment`)}
							onBlur={() => emailsValidate({ form, hasEmailData })}
						/>
					</div>
				);
			})}
		</div>
	);
};
