import { useContext, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, DatePicker, Input, TextField } from '@fsd/shared/ui-kit';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { useForm } from '@mantine/form';
import UserService from '@services/User.service';
import { Context } from '../auth-first-login';
import css from '../auth-first-login.module.scss';
import Constants from '../auth.first.login.constants';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';

const Component = observer((): JSX.Element => {
	const { store } = useContext(Context);
	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			surName: '',
			birthday: new Date(),
		},
	});

	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();

	useEffect(() => {
		if (auth.firstName && auth.lastName) {
			form.setFieldValue('firstName', auth.firstName);
			form.setFieldValue('lastName', auth.lastName);
		}

		if (store.user.id) {
			form.setFieldValue('firstName', store.user.firstName);
			form.setFieldValue('lastName', store.user.lastName);
			form.setFieldValue('surName', store.user.surName);
			form.setFieldValue('birthday', parseISO(store.user.birthday));
		} else if (auth.userId) {
			(async () => {
				const [user] = await UserService.findById(auth.userId ?? 0);
				if (!user) return;

				store.setUser(user);

				form.setFieldValue('firstName', user.firstName);
				form.setFieldValue('lastName', user.lastName);
				form.setFieldValue('surName', user.surName);
				form.setFieldValue('birthday', parseISO(user.birthday));
			})();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth]);

	const onSubmit = async () => {
		const { firstName, lastName, surName, birthday } = form.values;

		if (firstName.length < 2 || firstName.length > 64) {
			form.setFieldError('firstName', Constants.VALIDATION.FIRST_NAME.WRONG_LENGTH);
			return;
		}

		if (lastName.length < 2 || lastName.length > 64) {
			form.setFieldError('lastName', Constants.VALIDATION.LAST_NAME.WRONG_LENGTH);
			return;
		}

		if (!birthday) {
			form.setFieldError('birthday', Constants.VALIDATION.BIRTHDAY.EMPTY);
			return;
		}

		const dto: IUserUpdateDto = {
			userDto: {
				firstName,
				lastName,
				surName,
				birthday: format(form.values.birthday, 'yyyy-MM-dd'),
			},
		};
		const [updatedUser] = await UserService.updateById(store.user.id, dto);
		if (updatedUser) {
			store.setUser(updatedUser);
			form.reset();
			store.setStep(2);
		}
	};

	return (
		<div>
			<TextField className={css.info} dangerouslySetInnerHTML={{ __html: Constants.TEXT.STEP_ONE }} />
			<div className={css.form__one}>
				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Имя"
					{...form.getInputProps('firstName')}
					required
				/>
				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Фамилия"
					{...form.getInputProps('lastName')}
					required
				/>
				<Input mode="text" variant="white" size="medium" label="Отчество" {...form.getInputProps('surName')} />
				<DatePicker label="День рождения" required {...form.getInputProps('birthday')} />
			</div>

			<div className={css.buttons}>
				<Button
					size="large"
					className={css.prev}
					onClick={() => {
						appActions.setAuthData({ ...auth, step: 1 });
					}}
				>
					{Constants.BUTTON.CANCEL}
				</Button>
				<Button color="primary" variant="hard" size="large" className={css.next} onClick={onSubmit}>
					{Constants.BUTTON.NEXT}
				</Button>
			</div>
		</div>
	);
});

export default Component;
