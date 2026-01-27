import { FC, useContext, useEffect, useState } from 'react';
import { StaffUserRegistrationConstants } from './constants';
import { format, parseISO, subYears } from 'date-fns';
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
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const StaffUserHireModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const roles = useStateSelector((state) => state.app.auth.roles);

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
			password: '',
			passwordConfirm: '',
			photo: '',
			color: '',
			telegramId: 0,
			isFixLate: true,

			// Step 3
			departmentId: '',
			territoryId: '',
			workPosition: '',
			parentId: '',

			// Step 4
			phoneVoip: 0,
			phoneMobile: 0,
			email: '',
			telegram: '',
			facebook: '',
			instagram: '',
		},
	});

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		if (!modalStore.modals.staffUserHire) return;

		(async () => {
			await staffStore.getUserList();
			await staffStore.getDepartmentList();
			await staffStore.getTerritoryList();

			if (isMounted) {
				form.setFieldValue('departmentId', String(staffStore.departmentParent?.id));
				form.setFieldValue('territoryId', String(staffStore.territoryList[0]?.id));
				form.setFieldValue('firstName', staffStore.userCurrent.firstName);
				form.setFieldValue('lastName', staffStore.userCurrent.lastName);
				form.setFieldValue('surname', staffStore.userCurrent.surName);
				form.setFieldValue('birthday', parseISO(staffStore.userCurrent.birthday));
				form.setFieldValue('sex', staffStore.userCurrent.sex);
				form.setFieldValue('username', staffStore.userCurrent.username);
				form.setFieldValue('color', staffStore.userCurrent.color);
				form.setFieldValue('photo', staffStore.userCurrent.photo);
				form.setFieldValue('telegramId', Number(staffStore.userCurrent.telegramId));
				form.setFieldValue('isFixLate', staffStore.userCurrent.isFixLate);
				form.setFieldValue('departmentId', String(staffStore.userCurrent.departmentId));
				form.setFieldValue('territoryId', String(staffStore.userCurrent.territoryId));
				form.setFieldValue('workPosition', staffStore.userCurrent.workPosition);
				form.setFieldValue('phoneVoip', Number(staffStore.userCurrent.phoneVoip));
				form.setFieldValue('phoneMobile', Number(staffStore.userCurrent.phoneMobile));
				form.setFieldValue('email', staffStore.userCurrent.email);
				form.setFieldValue('telegram', staffStore.userCurrent.telegram);
				form.setFieldValue('facebook', staffStore.userCurrent.facebook);
				form.setFieldValue('instagram', staffStore.userCurrent.instagram);

				if (staffStore.userCurrent.parent?.id)
					form.setFieldValue('parentId', String(staffStore.userCurrent.parent?.id));

				setIsLoading(false);
			}
		})();

		if (!form.values.color) form.setFieldValue('color', AvatarDefaultColors[Math.floor(Math.random() * (35 + 1))]);

		return () => {
			isMounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.staffUserHire, staffStore]);

	const onSubmit = async () => {
		setIsLoading(true);

		const dto: IUserRegistrationRequest = {
			userDto: {
				username: form.values.username,
				firstName: form.values.firstName,
				lastName: form.values.lastName,
				surName: form.values.surname,
				workPosition: form.values.workPosition,
				birthday: format(form.values.birthday, 'yyyy-MM-dd'),
				sex: form.values.sex,
				color: form.values.color,
				telegramId: String(form.values.telegramId),
				photo: form.values.photo,
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
			if (form.values.photo.startsWith('blob:')) {
				await FileService.deleteFile('/uploads' + staffStore.userCurrent.photo);
				const [uploadedPhoto] = await FileService.uploadImageHelper(form.values.photo, 'avatar');
				if (uploadedPhoto) dto.userDto.photo = uploadedPhoto.url;
			}

			await UserService.updateById(staffStore.userCurrent.id, dto);

			showNotification({
				color: 'green',
				message:
					`Вы только что восстановили сотрудника ${dto.userDto.lastName} ${dto.userDto.firstName} ` +
					`в должности ${dto.userDto.workPosition}.`,
			});

			modalStore.modalOpen('staffUserHire', false);
			await staffStore.getUserList();
			await staffStore.setCurrentUserById(String(staffStore.userCurrent.id));
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
			title="Восстановление сотрудника"
			opened={modalStore.modals.staffUserHire}
			onClose={() => modalStore.modalOpen('staffUserHire', false)}
			size={475}
		>
			<StepperV1
				mode="edit"
				loading={isLoading}
				steps={[
					{
						validation: async () => {
							setIsLoading(true);

							if (form.values.firstName.length < 2 || form.values.firstName.length > 32) {
								form.setFieldError(
									'firstName',
									StaffUserRegistrationConstants.VALIDATE_FIRST_NAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

							if (form.values.lastName.length < 2 || form.values.lastName.length > 32) {
								form.setFieldError(
									'lastName',
									StaffUserRegistrationConstants.VALIDATE_LAST_NAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							}

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

							if (form.values.username.length < 4 || form.values.username.length > 32) {
								form.setFieldError(
									'username',
									StaffUserRegistrationConstants.VALIDATE_USERNAME_WRONG_LENGTH
								);
								setIsLoading(false);
								return true;
							} else if (staffStore.userCurrent.username !== form.values.username) {
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

							setIsLoading(false);
						},
						display: (
							<div className={css.stepTwo}>
								<Input
									label="Логин"
									{...form.getInputProps('username')}
									className={css.username}
									required
									disabled={!roles?.includes('admin')}
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

							if (!form.values.phoneVoip || String(form.values.phoneVoip).length < 3) {
								form.setFieldError(
									'phoneVoip',
									StaffUserRegistrationConstants.VALIDATE_PHONE_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							} else {
								const [findDuplicate] = await UserService.findByVoip(String(form.values.phoneVoip));
								if (findDuplicate && findDuplicate.id !== staffStore.userCurrent.id) {
									form.setFieldError(
										'phoneVoip',
										StaffUserRegistrationConstants.VALIDATE_VOIP_DUPLICATE
									);
									setIsLoading(false);
									return true;
								}
							}

							if (!form.values.phoneMobile || String(form.values.phoneMobile).length < 12) {
								form.setFieldError(
									'phoneMobile',
									StaffUserRegistrationConstants.VALIDATE_PHONE_NOT_FILLED
								);
								setIsLoading(false);
								return true;
							}

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
						modalStore.modalOpen('staffUserHire', false);
						form.reset();
					},
				}}
				finish={{
					buttonName: 'Восстановить',
					onChange: async () => {
						await onSubmit();
					},
				}}
			/>
		</Modal>
	);
});
