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

export const StaffDepartmentChangeToUserModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);

	const form = useForm({
		initialValues: {
			departmentId: '',
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffDepartmentChangeToUser || !staffStore?.userCurrent?.departmentId) return;

		(async () => {
			form.setFieldValue('departmentId', String(staffStore?.userCurrent?.departmentId));
			await staffStore.getDepartmentList();
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore, staffStore, staffStore?.userCurrent]);

	const onSubmit = async () => {
		if (String(staffStore.userCurrent.departmentId) !== form.values.departmentId) {
			await UserService.updateDepartmentByUserId(staffStore.userCurrent.id, Number(form.values.departmentId));
			await staffStore.getDepartmentList();
		}

		showNotification({
			color: 'green',
			// eslint-disable-next-line max-len
			message: `Для сотрудника ${staffStore.userCurrent.lastName} ${staffStore.userCurrent.firstName} изменен отдел.`,
		});

		modalStore.modalOpen('staffDepartmentChangeToUser', false);

		form.reset();
	};

	return (
		<Modal
			opened={modalStore.modals.staffDepartmentChangeToUser}
			onClose={() => modalStore.modalOpen('staffDepartmentChangeToUser', false)}
			title="Изменение отдела"
			size={450}
		>
			<Head>
				<title>
					Изменение отдела для {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}. Back
					Office
				</title>
			</Head>

			<div className={css.root}>
				<StaffAvatar user={staffStore.userCurrent} className={css.avatar} />
				<TextField size="large" className={css.name}>
					{staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}
				</TextField>
				<TextField className={css.currentDepartment}>
					Текущий отдел: {staffStore?.userCurrent?.department?.name}
				</TextField>
				<Select
					data={[
						{
							value: String(staffStore.departmentParent?.id),
							label: String(staffStore.departmentParent?.name),
						},
						...(staffStore.departmentChildList?.map((department) => ({
							value: String(department.id),
							label: String(department.name),
						})) as SelectItem[]),
					]}
					label="Отдел"
					{...form.getInputProps('departmentId')}
					className={css.select}
					required
				/>
			</div>

			<Modal.Buttons>
				<Button
					color="neutral"
					onClick={async () => {
						await staffStore.getDepartmentList();
						modalStore.modalOpen('staffDepartmentChangeToUser', false);
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
