import { FC } from 'react';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { RequisiteDeleteModalProps } from '.';
import css from './requisite-delete-modal.module.scss';

export const RequisiteDeleteModal: FC<RequisiteDeleteModalProps> = (
	{ current, opened, setOpened, onSuccess, ...props }
) => {
	const handleModalClose = () => {
		setOpened(false);
	};

	const handleSubmit = () => {
		if (!current) return;
		handleModalClose();
		onSuccess(current);
	};

	return (
		<>
			{opened && (<Head><title>Удаление реквизита</title></Head>)}

			<Modal
				title={'Удаление реквизита'}
				size={480}
				opened={opened}
				onClose={handleModalClose}
			>
				<div className={css.wrapper} {...props}>
					<TextField>
						Вы уверены что хотите удалить эти реквизиты?
						После удаления, восстановить их уже не получится!
					</TextField>

					<TextField>
						<b>{current?.name}</b>
						<br />
						ИНН: <b>{current?.inn}</b>
					</TextField>

					<Modal.Buttons>
						<Button
							onClick={handleModalClose}
						> Отмена </Button>

						<Button
							color={'error'}
							variant={'hard'}
							iconLeft={<Icon name='trash' />}
							onClick={handleSubmit}
						> Удалить </Button>
					</Modal.Buttons>
				</div>
			</Modal>
		</>
	);
};
