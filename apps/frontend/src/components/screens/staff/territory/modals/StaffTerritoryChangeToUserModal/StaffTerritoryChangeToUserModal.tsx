import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Modal, Select, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import UserService from '@services/User.service';
import css from './styles.module.scss';
import { StaffAvatar } from '@fsd/entities/staff';

export const StaffTerritoryChangeToUserModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const form = useForm({
		initialValues: {
			territoryId: '',
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffTerritoryChangeToUser) return;

		(async () => {
			form.setFieldValue('territoryId', String(staffStore?.userCurrent?.territoryId));
			await staffStore.getTerritoryList();
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore, staffStore, staffStore?.userCurrent]);

	const onSubmit = async () => {
		showNotification({
			color: 'green',
			message:
				`Для сотрудника ${staffStore.userCurrent.lastName} ` +
				`${staffStore.userCurrent.firstName} изменена территория.`,
		});

		modalStore.modalOpen('staffTerritoryChangeToUser', false);

		if (String(staffStore.userCurrent.territoryId) !== form.values.territoryId) {
			await UserService.updateTerritoryByUserId(staffStore.userCurrent.id, Number(form.values.territoryId));
		}

		await staffStore.getTerritoryList();
		form.reset();
	};

	return (
		<Modal
			opened={modalStore.modals.staffTerritoryChangeToUser}
			onClose={() => modalStore.modalOpen('staffTerritoryChangeToUser', false)}
			title="Изменение территории"
			size={450}
		>
			<Head>
				<title>
					Изменение территорий для {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}. Back
					Office
				</title>
			</Head>

			<div className={css.root}>
				<StaffAvatar user={staffStore.userCurrent} className={css.avatar} />
				<TextField size="large" className={css.name}>
					{staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}
				</TextField>
				<TextField className={css.currentTerritory}>
					Текущая территория: {staffStore?.userCurrent?.territory?.name}
				</TextField>
				<Select
					data={[
						...(staffStore.territoryList?.map((territory) => ({
							value: String(territory.id),
							label: String(territory.name),
						})) as SelectItem[]),
					]}
					label="Территория"
					{...form.getInputProps('territoryId')}
					className={css.select}
					required
				/>
			</div>

			<Modal.Buttons>
				<Button
					color="neutral"
					onClick={() => {
						staffStore.getTerritoryList();
						modalStore.modalOpen('staffTerritoryChangeToUser', false);
					}}
				>
					Отмена
				</Button>
				<Button color="primary" variant="hard" type="submit" onClick={onSubmit}>
					Изменить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
