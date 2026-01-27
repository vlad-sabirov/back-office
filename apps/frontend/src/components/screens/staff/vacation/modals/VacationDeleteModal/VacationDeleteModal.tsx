import { FC, useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { VacationContext } from '../../Vacation';
import { VacationService } from '../../vacation.service';
import { VacationDeleteModalProps } from '.';
import css from './vacation-delete-modal.module.scss';

export const VacationDeleteModal: FC<VacationDeleteModalProps> = ({ data, opened, setOpened, ...props }) => {
	const { vacationStore } = useContext(VacationContext);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (data) setIsLoading(false);
	}, [data]);

	const handleModalClose = () => {
		setOpened(false);
	};

	const handleDelete = async () => {
		if (!data) return;
		setIsLoading(true);

		const [, error] = await VacationService.deleteById(data.id);
		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Информация о отпуске сохранена' });
		vacationStore.getVacations().then();
		setIsLoading(false);
		handleModalClose();
	};

	return (
		<>
			{opened && (
				<Head>
					<title>Удалить отпуск из системы?</title>
				</Head>
			)}

			<Modal
				title={'Удалить отпуск из системы?'}
				size={480}
				opened={opened}
				onClose={handleModalClose}
				loading={isLoading}
			>
				<div className={css.wrapper} {...props}>
					<TextField>
						Вы уверены что хотите удалить запись о отпуске сотрудника {data?.user?.lastName}{' '}
						{data?.user?.firstName}? После удаления этой записи, восстановить ее будет невозможно.
					</TextField>

					<Modal.Buttons>
						<Button onClick={handleModalClose}>Отмена</Button>

						<Button color="error" variant="hard" iconLeft={<Icon name="trash" />} onClick={handleDelete}>
							Удалить
						</Button>
					</Modal.Buttons>
				</div>
			</Modal>
		</>
	);
};
