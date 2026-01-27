import { FC, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Avatar, Button, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import {
	Checkbox,
	TransferList,
	TransferListData,
	TransferListItem,
	TransferListItemComponent,
	TransferListItemComponentProps,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { UserRoleContext } from '../../UserRole';
import UserRoleService from '../../user-role.service';
import css from './styles.module.scss';

export const ItemComponent: TransferListItemComponent = ({ data, selected }: TransferListItemComponentProps) => (
	<div className={css.itemWrapper}>
		<Avatar {...data.avatar} size="small" />

		<div>
			<TextField size="small" className={css.name}>
				{data.label}
			</TextField>

			<TextField size="small" className={css.workPosition}>
				{data.description}
			</TextField>
		</div>

		<Checkbox checked={selected} onChange={() => true} tabIndex={-1} sx={{ pointerEvents: 'none' }} />
	</div>
);

export const UserRoleStaff: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const { userRoleStore } = useContext(UserRoleContext);
	const [data, setData] = useState<TransferListData>([[], []]);

	const closeSelfModal = () => {
		modalStore.modalOpen('userRoleStaff', false);
	};

	useEffect(() => {
		if (modalStore.modals.userRoleStaff && staffStore.userList) {
			const leftData: TransferListItem[] = [];
			const rightData: TransferListItem[] = [];

			staffStore.userList.map((staffUser) => {
				const data = {
					value: String(staffUser.id),
					label: `${staffUser.lastName} ${staffUser.firstName}`,
					description: staffUser.workPosition,
					avatar: {
						color: staffUser.color,
						text: `${staffUser.lastName[0]}${staffUser.firstName[0]}`,
						src: staffUser.photo,
					},
				};
				userRoleStore.roleCurrent?.users &&
				userRoleStore.roleCurrent.users.some((roleUser) => roleUser.id === staffUser.id)
					? rightData.push(data)
					: leftData.push(data);
			});

			setData([leftData, rightData]);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.userRoleStaff, userRoleStore.roleCurrent?.id]);

	const onSave = async () => {
		if (userRoleStore.roleCurrent?.id) {
			const isInRole = data[1] ? data[1].map((user) => Number(user.value)) : [];
			const error = await UserRoleService.updateRoleStaff(userRoleStore.roleCurrent.id, isInRole);

			if (error) {
				showNotification({
					message: error.message,
					color: 'red',
				});
				return;
			}

			showNotification({
				message: `Информация о пользователях роли ${userRoleStore.roleCurrent.alias} сохранена!`,
				color: 'green',
			});

			await userRoleStore.getRoleList();
			closeSelfModal();
		}
	};

	return (
		<Modal
			title="Список пользователей"
			opened={modalStore.modals.userRoleStaff}
			onClose={closeSelfModal}
			size={720}
		>
			<Head>
				<title>Роли пользователей. Back Office</title>
			</Head>

			<div>
				<TextField className={css.description}>
					Список пользователей роли <span>{userRoleStore.roleCurrent?.alias}</span>
				</TextField>
				<TextField>Описание: {userRoleStore.roleCurrent?.description}</TextField>

				<TransferList
					value={data}
					onChange={setData}
					searchPlaceholder="Поиск..."
					nothingFound="Пусто"
					listHeight={300}
					itemComponent={ItemComponent}
					className={css.transferList}
				/>
			</div>

			<Modal.Buttons>
				<Button onClick={closeSelfModal}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={onSave}>
					Сохранить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
