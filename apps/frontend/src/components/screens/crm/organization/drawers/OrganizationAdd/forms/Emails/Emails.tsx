import { FC } from 'react';
import { Input, TextField } from '@fsd/shared/ui-kit';
import { EmailsProps, emailsValidate, FIELD_NAME_EMAILS } from '.';
import css from './emails.module.scss';

export const Emails: FC<EmailsProps> = ({ form, className }) => {
	const handleAddEmail = () => {
		form.setFieldValue(
			FIELD_NAME_EMAILS,
			[...form.values[FIELD_NAME_EMAILS], { value: '', comment: '' }]
		);
	}

	return (
		<div className={css.root}>
			<div className={css.description}>
				<TextField
					size={'small'}
					className={css.label}
				> Почта </TextField>
				
				<TextField
					size={'small'}
					className={css.add}
					onClick={handleAddEmail}
				> Добавить </TextField>
			</div>

			{form.values[FIELD_NAME_EMAILS].map((_, index) => {
				return (
					<div className={css.item} key={index}>
						<Input
							mode={'email'}
							{...form.getInputProps(`${FIELD_NAME_EMAILS}.${index}.value`)}
							onBlur={() => emailsValidate({ form })}
							className={className}
						/>
						<Input
							{...form.getInputProps(`${FIELD_NAME_EMAILS}.${index}.comment`)}
							placeholder={'Комментарий...'}
							onBlur={() => emailsValidate({ form })}
							className={className}
						/>
					</div>
				);
			})}
		</div>
	);
};
