import { FC, useContext, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Avatar, Button, DatePicker, Input, Modal } from '@fsd/shared/ui-kit';
import { AvatarDefaultColors } from '@fsd/shared/ui-kit/avatar-changer/common/AvatarColors';
import { MainContext } from '@globalStore';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { ColorPicker } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import UserService from '@services/User.service';
import { EditPersonalInfoProps } from './props';
import css from './styles.module.scss';

export const EditPersonalInfoModal: FC<EditPersonalInfoProps> = observer(({ user }) => {
	const { modalStore, staffStore } = useContext(MainContext);
	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();

	const form = useForm({
		initialValues: {
			color: '' as string,
			firstName: '' as string,
			lastName: '' as string,
			surName: '' as string,
			birthday: new Date() as Date,
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffCardPersonalInfoEdit) return;

		if (user?.color) form.setFieldValue('color', user?.color);
		if (user?.firstName) form.setFieldValue('firstName', user?.firstName);
		if (user?.lastName) form.setFieldValue('lastName', user?.lastName);
		if (user?.surName) form.setFieldValue('surName', user?.surName);
		if (user?.birthday) form.setFieldValue('birthday', parseISO((user?.birthday as string) || ''));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffCardPersonalInfoEdit, user]);

	const onSubmit = async () => {
		const { color, firstName, lastName, surName } = form.values;

		if (!color) {
			form.setFieldError('color', 'Укажите цвет');
			return;
		}

		if (color.length !== 7) {
			form.setFieldError('color', 'Укажите цвет');
			return;
		}

		if (!lastName) {
			form.setFieldError('lastName', 'Укажите фамилию');
			return;
		}

		if (lastName.length < 2 || lastName.length > 64) {
			form.setFieldError('lastName', 'От 2 до 64 символов');
			return;
		}

		if (!firstName) {
			form.setFieldError('firstName', 'Укажите имя');
			return;
		}

		if (firstName.length < 2 || firstName.length > 64) {
			form.setFieldError('firstName', 'От 2 до 64 имя');
			return;
		}

		const dto: IUserUpdateDto = {
			userDto: {
				color,
				firstName,
				lastName,
				surName,
				birthday: format(form.values.birthday, 'yyyy-MM-dd'),
			},
		};

		await UserService.updateById(user.id, dto);
		showNotification({
			color: 'green',
			message: `Вам удалось изменить свои персональные данные.`,
		});

		appActions.setAuthData({
			...auth,
			color,
			firstName,
			lastName,
		});

		modalStore.modalOpen('staffCardPersonalInfoEdit', false);
		await staffStore.getUserList();
		await staffStore.setCurrentUserById(String(user.id));
		form.reset();
	};

	return (
		<Modal
			title="Персональная информация"
			opened={modalStore.modals.staffCardPersonalInfoEdit}
			onClose={() => {
				modalStore.modalOpen('staffCardPersonalInfoEdit', false);
				form.reset();
			}}
			size={500}
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<div className={css.wrapper}>
					<Avatar
						color={form.values.color}
						text={user?.lastName?.[0] + user?.firstName?.[0]}
						src={user?.photo}
						size="extraLarge"
						className={css.photo}
					/>
					<ColorPicker
						format="hex"
						withPicker={false}
						swatches={AvatarDefaultColors}
						fullWidth
						{...form.getInputProps('color')}
						className={css.color}
					/>

					<Input
						mode="text"
						variant="white"
						size="medium"
						label="Фамилия"
						required
						{...form.getInputProps('lastName')}
						className={css.lastName}
					/>

					<Input
						mode="text"
						variant="white"
						size="medium"
						label="Имя"
						required
						{...form.getInputProps('firstName')}
						className={css.firstName}
					/>

					<Input
						mode="text"
						variant="white"
						size="medium"
						label="Отчество"
						{...form.getInputProps('surName')}
						className={css.surName}
					/>

					<DatePicker
						label="День рождения"
						className={css.birthday}
						required
						{...form.getInputProps('birthday')}
					/>
				</div>

				<Modal.Buttons>
					<Button onClick={() => modalStore.modalOpen('staffCardPersonalInfoEdit')}>Отмена</Button>
					<Button color="primary" variant="hard" type="submit">
						Сохранить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
});
