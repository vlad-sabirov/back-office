import { ChangeEvent, FC, useCallback } from 'react';
import { IFormNotifTelegramProps } from './form-notif-telegram.types';
import { Switch } from '@fsd/shared/ui-kit';
import css from '@fsd/widgets/todo-create-modal/ui/_create-modal/create-modal.module.scss';

export const FormNotifTelegram: FC<IFormNotifTelegramProps> = (props) => {
	const { value, onChange, disabled } = props;

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			onChange(e.currentTarget.checked);
		},
		[onChange]
	);

	return (
		<Switch
			size={'small'}
			label={'Отправлять уведомление в телеграм'}
			checked={value}
			onChange={handleChange}
			className={css.switch}
			disabled={disabled}
		/>
	);
};
