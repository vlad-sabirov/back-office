import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import { UserRoleContext } from '../../UserRole';
import UserRoleService from '../../user-role.service';

export const UserRoleDelete: FC = observer(() => {
	const { modalStore } = useContext(MainContext);
	const { userRoleStore } = useContext(UserRoleContext);

	const closeSelfModal = () => modalStore.modalOpen('userRoleDelete', false);

	const onClick = async () => {
		if (!userRoleStore.roleCurrent) return;

		if (userRoleStore.roleList.length === 1) {
			showNotification({
				color: 'red',
				message:
					`Невозможно удалить роль ${userRoleStore.roleCurrent?.alias}, ` +
					// eslint-disable-next-line max-len
					`так как она является в системе единственной. Прежде чем удалить эту роль, для начала создайте новую.`,
			});
			closeSelfModal();
			return true;
		}

		const [, deleteRoleError] = await UserRoleService.deleteById(userRoleStore.roleCurrent.id);

		if (deleteRoleError) {
			showNotification({
				color: 'red',
				message: `Невозможно удалить роль ${userRoleStore.roleCurrent.alias},`
					+ ` так как она уже была ранее удалена.`,
			});

			closeSelfModal();
			return true;
		}

		showNotification({
			color: 'green',
			message: `Вы успешно удалили стадию ${userRoleStore.roleCurrent.alias}.`,
		});

		await userRoleStore.getRoleList();
		closeSelfModal();
	};

	return (
		<Modal opened={modalStore.modals.userRoleDelete} onClose={closeSelfModal} title="Удалить стадию?" size={450}>
			<Head>
				<title>Удаление роли {userRoleStore.roleCurrent?.alias}. Back Office</title>
			</Head>

			<TextField>
				Вы пытаетесь удалить роль <b>{userRoleStore.roleCurrent?.alias}</b>.
			</TextField>
			<TextField>
				После ее удаления, Вы не сможете восстановить данные. Точно удалить выбранную роль{' '}
				{userRoleStore.roleCurrent?.alias}?
			</TextField>

			<Modal.Buttons>
				<Button onClick={closeSelfModal}>Отмена</Button>

				<Button color="error" variant="hard" onClick={onClick}>
					<Icon name="trash" />
					&nbsp;Точно удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
