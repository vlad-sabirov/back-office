import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Input, Modal } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Access } from '@screens/staff/cfg';
import UserService from '@services/User.service';
import css from './styles.module.scss';

export const StaffChangePasswordModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const CheckAccess = useAccess();

	const form = useForm({
		initialValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async () => {
		if (!CheckAccess(Access.editPasswordSimple)) {
			if (form.values.oldPassword.length < 8 || form.values.oldPassword.length > 64) {
				form.setFieldError('oldPassword', 'Неверный пароль');
				return true;
			} else {
				const [, validateError] = await UserService.validateUser(
					staffStore.userCurrent.username,
					form.values.oldPassword
				);
				if (validateError) {
					form.setFieldError('oldPassword', 'Неверный пароль');
					return true;
				}
			}
		}

		if (form.values.newPassword.length < 8 || form.values.newPassword.length > 64) {
			form.setFieldError('newPassword', 'Поле пароля должно содержать от 8 до 64 символов');
			return true;
		}

		if (form.values.confirmPassword.length < 8 || form.values.confirmPassword.length > 64) {
			form.setFieldError('confirmPassword', 'Поле пароля должно содержать от 8 до 64 символов');
			return true;
		}

		if (form.values.newPassword !== form.values.confirmPassword) {
			form.setFieldError('newPassword', 'Пароли не совпадают');
			form.setFieldError('confirmPassword', 'Пароли не совпадают');
			return true;
		}

		modalStore.modalOpen('staffUserChangePassword', false);
		form.reset();
		showNotification({
			color: 'green',
			message: `Вы успешно изменили пароль.`,
		});

		await UserService.updatePasswordByUserId(staffStore.userCurrent.id, form.values.newPassword);
	};

	return (
		<Modal
			opened={modalStore.modals.staffUserChangePassword}
			onClose={() => modalStore.modalOpen('staffUserChangePassword', false)}
			title="Изменение пароля"
			size={350}
		>
			<Head>
				<title>
					Изменение пароля {staffStore.userCurrent.lastName} {staffStore.userCurrent.firstName}. Back Office
				</title>
			</Head>

			<div className={css.wrapper}>
				{!CheckAccess(Access.editPasswordSimple) ? (
					<div className={css.oldPassword}>
						<Input label="Старый пароль" mode="password" {...form.getInputProps('oldPassword')} required />
					</div>
				) : null}

				<div className={css.oldPassword}>
					<Input label="Новый пароль" mode="password" {...form.getInputProps('newPassword')} required />
				</div>

				<div className={css.oldPassword}>
					<Input
						label="Повторите пароль"
						mode="password"
						{...form.getInputProps('confirmPassword')}
						required
					/>
				</div>
			</div>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('staffUserChangePassword')}>Отмена</Button>

				<Button color="success" variant="hard" onClick={onSubmit}>
					Сохранить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
