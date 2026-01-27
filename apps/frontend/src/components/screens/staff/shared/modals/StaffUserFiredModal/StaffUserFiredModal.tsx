import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import UserService from '@services/User.service';

export const StaffUserFiredModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const router = useRouter();

	return (
		<Modal
			opened={modalStore.modals.staffUserFired}
			onClose={() => modalStore.modalOpen('staffUserFired', false)}
			title="Удалить сотрудника?"
			size={500}
		>
			<Head>
				<title>
					Увольнение сотрудника {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}. Back
					Office
				</title>
			</Head>

			<TextField>
				Вы пытаетесь уволить сотрудника {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}.
			</TextField>
			<TextField>
				После увольнения, данные о сотруднике не удаляются, он просто помечается как уволенный и пропадает из
				общего списка сотрудников. Сотрудника всегда можно восстановить в должности.
			</TextField>
			<TextField>Вы уверены что хотите удалить выбранного сотрудника?</TextField>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('staffUserFired')}>Отмена</Button>

				<Button
					color="warning"
					variant="hard"
					onClick={async () => {
						await router.push('/staff/list');

						showNotification({
							color: 'green',
							message:
								`Вы только что уволили сотрудника ${staffStore.userCurrent.lastName} ` +
								`${staffStore.userCurrent.firstName}.`,
						});

						await UserService.updateFiredByUserId(staffStore.userCurrent.id);
						await staffStore.getUserList();
						await staffStore.getDepartmentList();
						await staffStore.getTerritoryList();
						await modalStore.modalOpen('staffUserFired', false);
					}}
				>
					<Icon name="fired" />
					&nbsp;Уволить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
