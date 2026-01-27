import { FC, useState } from 'react';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { LatenessCommentService } from '@services';
import { SubCommentDeleteModalProps } from '.';

export const SubCommentDeleteModal: FC<SubCommentDeleteModalProps> = ({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	data,
	commentID,
	isOpen,
	setOpen,
	onSuccess,
	className,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleClose = (): void => {
		setIsLoading(false);
		setOpen(false);
	};

	const handleSubmit = async () => {
		if (!commentID) return;

		const [, errorDelete] = await LatenessCommentService.deleteById(commentID);

		if (errorDelete) {
			showNotification({ color: 'red', message: errorDelete.message });
			handleClose();
			return;
		}

		onSuccess?.();
		showNotification({ color: 'green', message: 'Комментарий удален' });
		handleClose();
	};

	return (
		<Modal title="Удаление комментария" opened={isOpen} onClose={handleClose} size={440} loading={isLoading}>
			<Head>
				<title>Удаление комментария</title>
			</Head>
			<div className={className} {...props}>
				<TextField>
					Вы уверены что хотите удалить этот комментарий? Восстановить его в дальнейшем будет невозможно.
				</TextField>

				<Modal.Buttons>
					<Button onClick={handleClose}>Отмена</Button>
					<Button color="error" variant="hard" iconLeft={<Icon name={'trash'} />} onClick={handleSubmit}>
						Удалить
					</Button>
				</Modal.Buttons>
			</div>
		</Modal>
	);
};
