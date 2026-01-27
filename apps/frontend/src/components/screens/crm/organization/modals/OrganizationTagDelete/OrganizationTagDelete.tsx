import { FC, useState } from 'react';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { CrmOrganizationTagService } from '@services';
import { OrganizationTagDeleteModalProps } from '.';

export const OrganizationTagDelete: FC<OrganizationTagDeleteModalProps> = ({
	data,
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
		if (!data) return;
		setIsLoading(true);

		const [, error] = await CrmOrganizationTagService.deleteById(data.id);
		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Данные удалены' });
		onSuccess?.();
		setIsLoading(false);
		handleClose();
	};

	return (
		<Modal title="Удалить?" opened={isOpen} onClose={handleClose} size={440} loading={isLoading}>
			<Head>
				<title>Удалить?</title>
			</Head>
			{data && (
				<div className={className} {...props}>
					<TextField>
						Вы уверены что хотите удалить тег: <strong>{data.name}</strong>?
					</TextField>

					<Modal.Buttons>
						<Button onClick={handleClose}>Отмена</Button>
						<Button
							color={'error'}
							variant={'hard'}
							iconLeft={<Icon name={'trash'} />}
							onClick={handleSubmit}
						>
							Удалить
						</Button>
					</Modal.Buttons>
				</div>
			)}
		</Modal>
	);
};
