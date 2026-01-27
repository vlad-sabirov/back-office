import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Input, Modal, Select } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IStaffDepartmentEditRequest } from '@screens/staff';
import { UserDepartmentService } from '../..';
import css from './styles.module.scss';

export const StaffDepartmentEditModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const form = useForm({
		initialValues: {
			name: '',
			parent: '',
		} as IStaffDepartmentEditRequest,

		validate: {
			name: (value) => {
				if (value.length < 2) return 'Минимальная длина: 3 символа';
				return null;
			},
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffDepartmentEdit || !staffStore.departmentCurrent) return;

		(async () => {
			if (staffStore.departmentCurrent.id) {
				const findParentDepartment = await UserDepartmentService.findDepartmentParentByChildId(
					staffStore.departmentCurrent.id
				);
				form.setFieldValue('name', staffStore?.departmentCurrent?.name);
				form.setFieldValue('parent', String(findParentDepartment?.data[0]?.id));
				await staffStore.getDepartmentList();
			}
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffDepartmentEdit, staffStore]);

	const onSubmit = async (dto: IStaffDepartmentEditRequest) => {
		try {
			const response = await UserDepartmentService.updateById(staffStore.departmentCurrent.id as number, dto);
			showNotification({
				color: 'green',
				message: `Вам удалось изменить отдел ${response.data?.name}.`,
			});
			modalStore.modalOpen('staffDepartmentEdit', false);
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
			opened={modalStore.modals.staffDepartmentEdit}
			onClose={() => modalStore.modalOpen('staffDepartmentEdit', false)}
			title="Изменение отдела"
			size={450}
		>
			<Head>
				<title>Изменение отдела {staffStore.departmentCurrent.name}. Back Office</title>
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
							modalStore.modalOpen('staffDepartmentEdit', false);
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
