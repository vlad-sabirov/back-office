import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import UserService from '@services/User.service';

export const StaffUserDeleteModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const router = useRouter();

	return (
		<Modal
			opened={modalStore.modals.staffUserDelete}
			onClose={() => modalStore.modalOpen('staffUserDelete', false)}
			title="Удалить сотрудника?"
			size={500}
		>
			<Head>
				<title>
					Удаление сотрудника {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}. Back
					Office
				</title>
			</Head>

			<TextField>
				Вы пытаетесь удалить сотрудника {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}.
			</TextField>
			<TextField>
				После его удаления, Вы не сможете восстановить данные. Точно удалить выбранного сотрудника?
			</TextField>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('staffUserDelete')}>Отмена</Button>

				<Button
					color="error"
					variant="hard"
					onClick={async () => {
						await router.push('/staff/list');

						showNotification({
							color: 'green',
							message:
								`Вы только что удалили сотрудника ${staffStore.userCurrent.lastName} ` +
								`${staffStore.userCurrent.firstName}.`,
						});

						await UserService.deleteById(staffStore.userCurrent.id as number);
						await staffStore.getUserList();
						await modalStore.modalOpen('staffUserDelete', false);
					}}
				>
					<Icon name="trash" />
					&nbsp;Точно удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
