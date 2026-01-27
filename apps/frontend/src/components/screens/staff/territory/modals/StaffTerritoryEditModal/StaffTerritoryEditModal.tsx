import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Input, Modal } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IStaffTerritoryEditRequest } from '@screens/staff';
import { UserTerritoryService } from '../..';
import css from './styles.module.scss';

export const StaffTerritoryEditModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const form = useForm({
		initialValues: {
			name: '',
			address: '',
		} as IStaffTerritoryEditRequest,

		validate: {
			name: (value) => {
				if (value.length < 3) return 'Минимальная длина имени: 3 символа';
				return null;
			},
			address: (value) => {
				if (value.length < 4) return 'Минимальная длина адреса: 4 символа';
				return null;
			},
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffTerritoryEdit) return;

		(async () => {
			if (staffStore.territoryCurrent.id) {
				form.setFieldValue('name', staffStore?.territoryCurrent?.name);
				form.setFieldValue('address', staffStore?.territoryCurrent?.address);
				await staffStore.getTerritoryList();
			}
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffTerritoryEdit, staffStore]);

	const onSubmit = async (dto: IStaffTerritoryEditRequest) => {
		try {
			const response = await UserTerritoryService.updateById(staffStore.territoryCurrent.id as number, dto);
			showNotification({
				color: 'green',
				message: `Вам удалось изменить территорию ${response.data?.name}.`,
			});
			modalStore.modalOpen('staffTerritoryEdit', false);
			await staffStore.getTerritoryList();
			form.reset();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			switch (error.response?.data?.message) {
				case 'Территория с таким названием уже существует':
					form.setFieldError('name', true);
					showNotification({
						color: 'red',
						message: 'Территория с таким названием уже существует',
					});
					break;

				case 'Территория с таким адресом уже существует':
					form.setFieldError('address', true);
					showNotification({
						color: 'red',
						message: 'Территория с таким адресом уже существует',
					});
					break;

				default:
					showNotification({
						color: 'red',
						message: 'Неизвестная ошибка',
					});
					break;
			}
		}
	};

	return (
		<Modal
			opened={modalStore.modals.staffTerritoryEdit}
			onClose={() => modalStore.modalOpen('staffTerritoryEdit', false)}
			title="Изменение территории"
			size={450}
		>
			<Head>
				<title>Изменение территорий {staffStore.territoryCurrent.name}. Back Office</title>
			</Head>

			<form onSubmit={form.onSubmit((value) => onSubmit(value))}>
				<div className={css.wrapper}>
					<Input label="Название территории" {...form.getInputProps('name')} required />
					<Input label="Адрес территории" {...form.getInputProps('address')} required />
				</div>

				<Modal.Buttons>
					<Button
						color="neutral"
						onClick={() => {
							staffStore.getTerritoryList();
							modalStore.modalOpen('staffTerritoryEdit', false);
						}}
					>
						Отмена
					</Button>
					<Button color="primary" variant="hard" type="submit">
						Изменить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
});
