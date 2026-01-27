import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import * as Types from './delete-contact.types';
import css from './delete-contact.module.scss';

export const DeleteContact: FC<Types.DeleteContactT> = (
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
				Вы пытаетесь удалить контакт: {current?.name} {current?.workPosition}.
				После удаления, не будет возможность восстановить контакт, будьте аккуратнее с этим.
			</TextField>

			<TextField>Вы уверены что хотите удалить контакт?</TextField>

			<div className={css.buttons}>
				<Button
					onClick={handleModalClose}
				> Отмена </Button>

				<Button
					color={'error'}
					variant={'hard'}
					iconLeft={<Icon name={'trash'} />}
					onClick={handleDelete}
				> Удалить </Button>
			</div>
		</div>
	);
};
