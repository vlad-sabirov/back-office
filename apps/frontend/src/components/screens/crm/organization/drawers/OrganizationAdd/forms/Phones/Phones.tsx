import { FC } from 'react';
import { Input, TextField } from '@fsd/shared/ui-kit';
import { PhonesProps, phonesValidate, FIELD_NAME_PHONES } from '.';
import css from './phones.module.scss';

export const Phones: FC<PhonesProps> = ({ form, className }) => {
	const handleAddPhone = () => {
		form.setFieldValue(
			FIELD_NAME_PHONES,
			[...form.values[FIELD_NAME_PHONES], { value: '', comment: '' }]
		);
	}

	return (
		<div className={css.root}>
			<div className={css.description}>
				<TextField
					size={'small'}
					className={css.label}
				> Телефоны </TextField>
				
				<TextField
					size={'small'}
					className={css.add}
					onClick={handleAddPhone}
				> Добавить </TextField>
			</div>

			{form.values[FIELD_NAME_PHONES].map((_, index) => {
				return (
					<div className={css.item} key={index}>
						<Input
							mode={'phone'}
							{...form.getInputProps(`${FIELD_NAME_PHONES}.${index}.value`)}
							onBlur={() => phonesValidate({ form })}
							className={className}
						/>
						<Input
							{...form.getInputProps(`${FIELD_NAME_PHONES}.${index}.comment`)}
							placeholder={'Комментарий...'}
							onBlur={() => phonesValidate({ form })}
							className={className}
						/>
					</div>
				);
			})}
		</div>
	);
};
