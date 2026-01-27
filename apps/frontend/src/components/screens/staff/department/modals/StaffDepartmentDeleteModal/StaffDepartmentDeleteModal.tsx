import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import { UserDepartmentService } from '../..';

export const StaffDepartmentDeleteModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const onClick = async () => {
		if (staffStore.departmentChildList.length <= 1) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line max-len
				message: `Невозможно удалить отдел ${staffStore.departmentCurrent.name}, так как он является последним.`,
			});

			return true;
		}

		await UserDepartmentService.deleteById(staffStore.departmentCurrent.id as number);
		await staffStore.getDepartmentList();
		await modalStore.modalOpen('staffDepartmentDelete', false);

		showNotification({
			color: 'green',
			message: `Вы только что удалили отдел ${staffStore.departmentCurrent.name}.`,
		});
	};

	return (
		<Modal
			opened={modalStore.modals.staffDepartmentDelete}
			onClose={() => modalStore.modalOpen('staffDepartmentDelete', false)}
			title="Удалить отдел?"
			size={450}
		>
			<Head>
				<title>Удаление отдела {staffStore.departmentCurrent.name}. Back Office</title>
			</Head>

			<TextField>
				Вы пытаетесь удалить отдел <b>{staffStore.departmentCurrent.name}</b>. После его удаления, Вы не сможете
				восстановить данные. Точно удалить выбранный отдел?
			</TextField>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('staffDepartmentDelete')}>Отмена</Button>

				<Button color="error" variant="hard" onClick={onClick}>
					<Icon name="trash" />
					&nbsp;Точно удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
