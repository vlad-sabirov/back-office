import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Input, Modal, Select } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IStaffDepartmentAddRequest, UserDepartmentService } from '../..';
import css from './styles.module.scss';

export const StaffDepartmentAddModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const form = useForm({
		initialValues: {
			name: '',
			parent: '',
		} as IStaffDepartmentAddRequest,

		validate: {
			name: (value) => {
				if (value.length < 2) return 'Минимальная длина: 3 символа';
				return null;
			},
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffDepartmentAdd) return;

		(async () => {
			form.setFieldValue('parent', String(staffStore.departmentParent.id));
			await staffStore.getDepartmentList();
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffDepartmentAdd, staffStore]);

	const onSubmit = async (dto: IStaffDepartmentAddRequest) => {
		try {
			const response = await UserDepartmentService.create(dto);
			showNotification({
				color: 'green',
				message: `Вам удалось добавить отдел ${response.data?.name}.`,
			});
			modalStore.modalOpen('staffDepartmentAdd', false);
			await staffStore.getDepartmentList();
			form.reset();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			switch (error.response?.data?.message) {
				case 'Департамент с таким названием уже существует':
					form.setFieldError('name', true);
					showNotification({
						color: 'red',
						message: 'Отдел с таким названием уже существует',
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
			opened={modalStore.modals.staffDepartmentAdd}
			onClose={() => modalStore.modalOpen('staffDepartmentAdd', false)}
			title="Добавление отдела"
			size={450}
		>
			<Head>
				<title>Добавление отдела. Back Office</title>
			</Head>
			<form onSubmit={form.onSubmit((value) => onSubmit(value))}>
				<div className={css.wrapper}>
					<Input label="Название отдела" {...form.getInputProps('name')} required />

					<Select
						data={[
							{
								value: String(staffStore.departmentParent.id),
								label: String(staffStore.departmentParent.name),
							},
							...(staffStore.departmentChildList?.map((department) => ({
								value: String(department.id),
								label: String(department.name),
							})) as SelectItem[]),
						]}
						label="Родительский отдел"
						{...form.getInputProps('parent')}
						required
					/>
				</div>

				<Modal.Buttons>
					<Button
						color="neutral"
						onClick={() => {
							staffStore.getDepartmentList();
							modalStore.modalOpen('staffDepartmentAdd', false);
						}}
					>
						Отмена
					</Button>
					<Button color="primary" variant="hard" type="submit">
						Добавить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
});
