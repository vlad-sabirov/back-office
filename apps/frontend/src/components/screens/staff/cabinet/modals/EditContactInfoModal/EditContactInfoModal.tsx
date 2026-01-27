import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, InputNumber, Modal } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import UserService from '@services/User.service';
import { EditContactInfoProps } from './props';
import css from './styles.module.scss';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const EditContactInfoModal: FC<EditContactInfoProps> = observer(({ user }) => {
	const { modalStore, staffStore } = useContext(MainContext);
	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();

	const form = useForm({
		initialValues: {
			phoneVoip: 0 as number,
			phoneMobile: 0 as number,
			email: '' as string,
			telegram: '' as string,
			facebook: '' as string,
			instagram: '' as string,
		},
	});

	useEffect(() => {
		if (!modalStore.modals.staffCardContactInfoEdit) return;

		form.setFieldValue('phoneVoip', Number(user.phoneVoip));
		form.setFieldValue('phoneMobile', Number(user.phoneMobile));
		form.setFieldValue('email', user.email);
		form.setFieldValue('telegram', user.telegram);
		form.setFieldValue('facebook', user.facebook);
		form.setFieldValue('instagram', user.instagram);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffCardContactInfoEdit, user]);

	const onSubmit = async () => {
		const { phoneVoip, phoneMobile, email, telegram, facebook, instagram } = form.values;

		if (!phoneVoip || String(phoneVoip).length < 3 || String(phoneVoip).length > 3) {
			form.setFieldError('phoneVoip', 'Номер состоит из 3 цифр');
			return;
		} else {
			const [findDuplicate] = await UserService.findByVoip(String(phoneVoip));
			if (findDuplicate && findDuplicate.id !== user.id) {
				form.setFieldError('phoneVoip', 'Номер уже занят');
				return;
			}
		}

		if (!phoneMobile || String(phoneMobile).length < 12) {
			form.setFieldError('phoneMobile', 'Неверный формат номера');
			return;
		}

		// noinspection RegExpRedundantEscape
		if (
			!email.match(
				// eslint-disable-next-line no-useless-escape, max-len
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
		) {
			form.setFieldError('email', 'Неверный формат почтового ящика');
			return true;
		}

		const dto: IUserUpdateDto = {
			userDto: {
				phoneVoip: String(phoneVoip),
				phoneMobile: String(phoneMobile),
				email,
				telegram,
				facebook,
				instagram,
			},
		};

		await UserService.updateById(user.id, dto);
		showNotification({
			color: 'green',
			message: `Вам удалось изменить свои персональные данные.`,
		});

		appActions.setAuthData({
			...auth,
			phone: {
				...auth.phone,
				voip: String(phoneVoip),
			}
		});

		modalStore.modalOpen('staffCardContactInfoEdit', false);
		await staffStore.getUserList();
		await staffStore.setCurrentUserById(String(user.id));
		form.reset();
	};

	return (
		<Modal
			title="Контактная информация"
			opened={modalStore.modals.staffCardContactInfoEdit}
			onClose={() => {
				modalStore.modalOpen('staffCardContactInfoEdit', false);
				form.reset();
			}}
			size={600}
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<div className={css.wrapper}>
					<InputNumber
						label="Внутренний"
						{...form.getInputProps('phoneVoip')}
						hideControls
						maxLength={3}
						required
					/>

					<InputNumber
						mode="phone"
						label="Мобильный"
						{...form.getInputProps('phoneMobile')}
						required
						maxLength={15}
					/>

					<Input label="Email" {...form.getInputProps('email')} required />

					<Input label="Telegram" {...form.getInputProps('telegram')} />

					<Input label="Facebook" {...form.getInputProps('facebook')} />

					<Input label="Instagram" {...form.getInputProps('instagram')} />
				</div>

				<Modal.Buttons>
					<Button onClick={() => modalStore.modalOpen('staffCardContactInfoEdit')}>Отмена</Button>
					<Button color="primary" variant="hard" type="submit">
						Сохранить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
});
