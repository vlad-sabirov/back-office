import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import { UserTerritoryService } from '../..';

export const StaffTerritoryDeleteModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const onClick = async () => {
		if (staffStore.territoryList.length <= 1) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line max-len
				message: `Невозможно удалить территорию ${staffStore.territoryCurrent.name}, так как оня является последней.`,
			});

			return true;
		}

		await UserTerritoryService.deleteById(staffStore.territoryCurrent.id as number);
		await staffStore.getTerritoryList();
		await modalStore.modalOpen('staffTerritoryDelete', false);

		showNotification({
			color: 'green',
			message: `Вы только что удалили территорию ${staffStore.territoryCurrent.name}.`,
		});
	};

	return (
		<Modal
			opened={modalStore.modals.staffTerritoryDelete}
			onClose={() => modalStore.modalOpen('staffTerritoryDelete', false)}
			title="Удалить территорию?"
			size={450}
		>
			<Head>
				<title>Удаление территорий {staffStore.territoryCurrent.name}. Back Office</title>
			</Head>

			<TextField>
				Вы пытаетесь удалить территорию <b>{staffStore.territoryCurrent.name}</b>. После ее удаления, Вы не
				сможете восстановить данные. Точно удалить выбранную территорию?
			</TextField>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('staffTerritoryDelete')}>Отмена</Button>

				<Button color="error" variant="hard" onClick={onClick}>
					<Icon name="trash" />
					&nbsp;Точно удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
