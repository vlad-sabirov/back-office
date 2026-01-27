import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import * as Types from './disconnect-contact.types';
import css from './disconnect-contact.module.scss';

export const DisconnectContact: FC<Types.DisconnectContactT> = (
	{ current, onSuccess, setModalVisible, ...props }
) => {
	const handleModalClose = () => {
		setModalVisible(false);
	}

	const handleDelete = async () => {
		if (!current) return;
		onSuccess(current);
		handleModalClose()
	}

	return (
		<div {...props}>
			<TextField>
				Вы пытаетесь открепить контакт: {current?.name} {current?.workPosition}.
				После открепления контакт не удаляется и его всегда можно прикрепить повторно.
			</TextField>

			<TextField>Вы уверены что хотите открепить контакт?</TextField>

			<div className={css.buttons}>
				<Button
					onClick={handleModalClose}
				> Отмена </Button>

				<Button
					color={'error'}
					variant={'hard'}
					iconLeft={<Icon name={'plus-medium'} style={{ transform: 'rotate(45deg)' }} />}
					onClick={handleDelete}
				> Открепить </Button>
			</div>
		</div>
	);
};
