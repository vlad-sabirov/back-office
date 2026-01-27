import { FC, useState } from 'react';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { CrmOrganizationTypeService } from '@services';
import { OrganizationTypeDeleteModalProps } from '.';

export const OrganizationTypeDelete: FC<OrganizationTypeDeleteModalProps> = ({
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

		const [, error] = await CrmOrganizationTypeService.deleteById(data.id);
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
		<Modal title="Удалить?" opened={isOpen} onClose={handleClose} size={360} loading={isLoading}>
			<Head>
				<title>Удалить?</title>
			</Head>
			{data && (
				<div className={className} {...props}>
					<TextField>
						После удаления все организации этой сферы деятельности будут перенесены в{' '}
						<strong>Другое</strong>.
					</TextField>
					<TextField>
						Вы уверены что хотите удалить сферу деятельности:{' '}
						<strong style={{ textTransform: 'capitalize' }}>{data.name}</strong>?
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
