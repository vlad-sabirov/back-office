import { FC, useContext, useEffect, useState } from 'react';
import { StaffUserRegistrationConstants } from './constants';
import { format, subYears } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { AvatarChanger, DatePicker, Icon, Input, InputNumber, Modal } from '@fsd/shared/ui-kit';
import { MultiSelect, SegmentedControl, Select, StepperV1, Switch } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { IUserRegistrationRequest } from '@interfaces/user/UserRegistration.request';
import { ColorPicker, SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import FileService from '@services/File.service';
import UserService from '@services/User.service';
import { AvatarDefaultColors } from '@fsd/shared/ui-kit/avatar-changer/common/AvatarColors';
import css from './styles.module.scss';

export const StaffUserRegistrationModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm({
		initialValues: {
			// Step 1
			firstName: '',
			lastName: '',
			surname: '',
			birthday: new Date(),
			sex: 'male',
			// Step 2
			username: '',
			password: '123456789',
			passwordConfirm: '123456789',
			photo: '',
			color: '',
			telegramId: '',
			isFixLate: true,
			// Step 3
			departmentId: '',
			territoryId: '',
			workPosition: '',
			parentId: '',
			// Step 4
			phoneVoip: '',
			phoneMobile: '',
			email: '',
			telegram: '',
			facebook: '',
			instagram: '',
		},
	});

	useEffect(() => {
		let isMounted = true;
		if (!modalStore.modals.staffUserRegister) return;

		(async () => {
			await staffStore.getUserList();
			await staffStore.getDepartmentList();
			await staffStore.getTerritoryList();

			if (isMounted) {
				form.setFieldValue('departmentId', String(staffStore.departmentParent?.id));
				form.setFieldValue('territoryId', String(staffStore.territoryList[0]?.id));
			}
		})();

		if (!form.values.color) form.setFieldValue('color', AvatarDefaultColors[Math.floor(Math.random() * (35 + 1))]);

		return () => {
			isMounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffUserRegister, staffStore]);

	const onSubmit = async () => {
		setIsLoading(true);

		const dto: IUserRegistrationRequest = {
			userDto: {
				username: form.values.username,
				password: form.values.password,
				firstName: form.values.firstName,
				lastName: form.values.lastName,
				surName: form.values.surname,
				workPosition: form.values.workPosition,
				birthday: format(form.values.birthday, 'yyyy-MM-dd'),
				sex: form.values.sex,
				color: form.values.color,
				photo: '',
				telegramId: String(form.values.telegramId),
				phoneVoip: String(form.values.phoneVoip),
				phoneMobile: String(form.values.phoneMobile),
				email: form.values.email,
				telegram: form.values.telegram,
				facebook: form.values.facebook,
				instagram: form.values.instagram,
				isFixLate: form.values.isFixLate,
				isFired: false,
			},
			departmentDto: Number(form.values.departmentId),
			territoryDto: Number(form.values.territoryId),
			parentDto: Number(form.values.parentId),
		};

		try {
			if (form.values.photo.startsWith('blob')) {
				const [uploadedPhoto] = await FileService.uploadImageHelper(form.values.photo, 'avatar');
				if (uploadedPhoto) dto.userDto.photo = uploadedPhoto.url;
			}

			await UserService.create(dto);
			showNotification({
				color: 'green',
				message:
					`Вам удалось зарегистрировать нового сотрудника с логином: ${form.values.username} ` +
					`и паролем: ${form.values.password}`,
			});

			modalStore.modalOpen('staffUserRegister', false);
			await staffStore.getUserList();
			form.reset();
			setIsLoading(false);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			setIsLoading(false);
			return;
		}
	};

	return (
		<Modal
			title="Регистрация"
			opened={modalStore.modals.staffUserRegister}
			onClose={() => modalStore.modalOpen('staffUserRegister')}
			size={475}
		>
			<StepperV1
				loading={isLoading}
				steps={[
					{
						validation: async () => {
							setIsLoading(true);

							// Длина имени
							if (form.values.firstName.length < 2 || form.values.firstName.length > 32) {
								form.setFieldError(
									'firstName',
									StaffUserRegistrationConstants.VALIDATE_FIRST_NAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							// Длина фамилии
							if (form.values.lastName.length < 2 || form.values.lastName.length > 32) {
								form.setFieldError(
									'lastName',
									StaffUserRegistrationConstants.VALIDATE_LAST_NAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							// Длина отчества
							if (
								form.values.surname.length > 0 &&
								(form.values.surname.length < 4 || form.values.surname.length > 32)
							) {
								form.setFieldError(
									'surname',
									StaffUserRegistrationConstants.VALIDATE_SURNAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							// Указание даты рождения
							if (form.values.birthday > subYears(new Date(), 3)) {
								form.setFieldError(
									'birthday',
									StaffUserRegistrationConstants.VALIDATE_BIRTHDAY_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							}

							setIsLoading(false);
						},
						display: (
							<div className={css.stepOne}>
								<Input
									label="Имя"
									{...form.getInputProps('firstName')}
									className={css.firstName}
									required
								/>

								<Input
									label="Фамилия"
									{...form.getInputProps('lastName')}
									className={css.lastName}
									required
								/>

								<Input
									label="Отчество"
									placeholder=""
									{...form.getInputProps('surname')}
									className={css.surname}
								/>

								<DatePicker
									label="День рождения"
									{...form.getInputProps('birthday')}
									className={css.birthday}
									required
								/>

								<SegmentedControl
									size="extraLarge"
									color={form.values.sex === 'male' ? 'male' : 'female'}
									label="Пол"
									fullWidth
									data={[
										{
											value: 'male',
											label: (
												<>
													<Icon name="male" style={{ justifySelf: 'right' }} />
													<span style={{ justifySelf: 'left' }}>Мужчина</span>
												</>
											),
										},
										{
											value: 'female',
											label: (
												<>
													<Icon name="female" style={{ justifySelf: 'right' }} />
													<span style={{ justifySelf: 'left' }}>Женщина</span>
												</>
											),
										},
									]}
									{...form.getInputProps('sex')}
									className={css.sex}
									required
								/>
							</div>
						),
					},

					{
						validation: async () => {
							setIsLoading(true);

							// Проверка длины логина
							if (form.values.username.length < 4 || form.values.username.length > 32) {
								form.setFieldError(
									'username',
									StaffUserRegistrationConstants.VALIDATE_USERNAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							// Проверка дубликатов по логину
							else {
								const [findDuplicate] = await UserService.findByUsername(form.values.username);
								if (findDuplicate) {
									form.setFieldError(
										'username',
										StaffUserRegistrationConstants.VALIDATE_USERNAME_DUPLICATE.output
									);
									setIsLoading(false);
									return true;
								}
							}

							// Длина пароля
							if (form.values.password.length < 8 || form.values.password.length > 64) {
								form.setFieldError(
									'password',
									StaffUserRegistrationConstants.VALIDATE_PASSWORD_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}
							if (form.values.passwordConfirm.length < 8 || form.values.passwordConfirm.length > 64) {
								form.setFieldError(
									'passwordConfirm',
									StaffUserRegistrationConstants.VALIDATE_PASSWORD_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							// Соответствие паролей
							if (form.values.password !== form.values.passwordConfirm) {
								form.setFieldError(
									'password',
									StaffUserRegistrationConstants.VALIDATE_PASSWORD_DO_NOT_MATCH
								);
								form.setFieldError(
									'passwordConfirm',
									StaffUserRegistrationConstants.VALIDATE_PASSWORD_DO_NOT_MATCH
								);
								setIsLoading(false);
								return true;
							}

							setIsLoading(false);
						},
						display: (
							<div className={css.stepTwo}>
								<Input
									label="Логин"
									{...form.getInputProps('username')}
									className={css.username}
									required
								/>

								<div className={css.avatarAndColor}>
									<AvatarChanger
										{...form.getInputProps('photo')}
										backgroundColor={form.values.color}
										className={css.avatar}
									/>

									<ColorPicker
										format="hex"
										size="lg"
										{...form.getInputProps('color')}
										withPicker={false}
										swatches={AvatarDefaultColors}
										fullWidth
										className={css.colors}
									/>
								</div>

								<InputNumber
									label="Telegram ID"
									hideControls
									{...form.getInputProps('telegramId')}
									className={css.passwordTelegramId}
								/>

								<Switch
									label="Фиксировать опоздания?"
									color="neutral"
									{...form.getInputProps('isFixLate', { type: 'checkbox' })}
									className={css.fixLate}
								/>
							</div>
						),
					},

					{
						validation: () => {
							setIsLoading(true);

							if (form.values.departmentId === 'null') {
								form.setFieldError('departmentId', StaffUserRegistrationConstants.VALIDATE_DEPARTMENT);
								setIsLoading(false);
								return true;
							}

							if (form.values.territoryId === 'null') {
								form.setFieldError('territoryId', StaffUserRegistrationConstants.VALIDATE_TERRITORY);
								setIsLoading(false);
								return true;
							}

							// Указание должности
							if (form.values.workPosition.length === 0) {
								form.setFieldError(
									'workPosition',
									StaffUserRegistrationConstants.VALIDATE_WORK_POSITION_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							}

							setIsLoading(false);
						},
						display: (
							<div className={css.stepThree}>
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
									label="Отдел"
									{...form.getInputProps('departmentId')}
									className={css.departmentId}
									required
								/>

								<Select
									data={[
										...(staffStore.territoryList?.map((territory) => ({
											value: String(territory.id),
											label: String(territory.name),
										})) as SelectItem[]),
									]}
									label="Территория"
									{...form.getInputProps('territoryId')}
									className={css.territoryId}
									required
								/>

								<Input
									label="Должность"
									{...form.getInputProps('workPosition')}
									className={css.workPosition}
									required
								/>

								<MultiSelect
									data={staffStore.userList?.map((user) => ({
										value: String(user.id),
										label: `${user.lastName} ${user.firstName}`,
										letters: user.lastName[0] + user.firstName[0],
										color: user.color,
										photo: user.photo,
									}))}
									searchable
									mode="staff"
									label="Руководитель"
									value={form.values.parentId ? [form.values.parentId] : []}
									onChange={(value) => {
										form.setFieldValue('parentId', value.length ? value[value.length - 1] : '');
									}}
									className={css.parentId}
								/>
							</div>
						),
					},

					{
						validation: async () => {
							setIsLoading(true);

							// Указание внутреннего номера телефона
							if (!form.values.phoneVoip || String(form.values.phoneVoip).length < 3) {
								form.setFieldError(
									'phoneVoip',
									StaffUserRegistrationConstants.VALIDATE_PHONE_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							}

							// Проверка дубликата по мобильному номеру
							else {
								const [findDuplicate] = await UserService.findByVoip(form.values.phoneVoip);
								if (findDuplicate) {
									form.setFieldError(
										'phoneVoip',
										StaffUserRegistrationConstants.VALIDATE_VOIP_DUPLICATE
									);
									setIsLoading(false);
									return true;
								}
							}

							// Указание мобильного номера телефона
							if (!form.values.phoneMobile || String(form.values.phoneMobile).length < 12) {
								form.setFieldError(
									'phoneMobile',
									StaffUserRegistrationConstants.VALIDATE_PHONE_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							}

							// Указание почтового ящика
							// noinspection RegExpRedundantEscape
							if (
								!form.values.email.match(
									// eslint-disable-next-line no-useless-escape, max-len
									/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
								)
							) {
								form.setFieldError('email', StaffUserRegistrationConstants.VALIDATE_EMAIL);
								setIsLoading(false);
								return true;
							}

							setIsLoading(false);
						},
						display: (
							<div className={css.stepFour}>
								<InputNumber
									label="Внутренний"
									{...form.getInputProps('phoneVoip')}
									className={css.phoneVoip}
									hideControls
									maxLength={3}
									required
								/>

								<InputNumber
									mode="phone"
									label="Мобильный"
									{...form.getInputProps('phoneMobile')}
									className={css.phoneMobile}
									required
									maxLength={15}
								/>

								<Input label="Email" {...form.getInputProps('email')} className={css.email} required />

								<Input label="Telegram" {...form.getInputProps('telegram')} className={css.telegram} />

								<Input label="Facebook" {...form.getInputProps('facebook')} className={css.facebook} />

								<Input
									label="Instagram"
									{...form.getInputProps('instagram')}
									className={css.instagram}
								/>
							</div>
						),
					},
				]}
				cancel={{
					onChange: () => {
						modalStore.modalOpen('staffUserRegister');
						form.reset();
					},
				}}
				finish={{
					buttonName: 'Завершить регистрацию',
					onChange: async () => {
						await onSubmit();
					},
				}}
			/>
		</Modal>
	);
});
