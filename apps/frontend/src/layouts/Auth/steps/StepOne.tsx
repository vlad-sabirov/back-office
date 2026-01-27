import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { useFocusTrap } from '@mantine/hooks';
import AuthService from '@services/Auth.service';
import css from './../Styles.module.scss';

export const AuthLayoutStopOne = observer((): JSX.Element => {
	const focusTrapRef = useFocusTrap();
	const form = useForm({
		initialValues: {
			username: '',
			password: '',
		},
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();

	const handleSubmit = async () => {
		setIsLoading(true);
		const { username, password } = form.values;

		if (username.length < 4 || username.length > 32) {
			form.setFieldError('username', 'Поле заполнено неверно');
			setIsLoading(false);
			return;
		}

		if (password.length < 2 || password.length > 64) {
			form.setFieldError('password', 'Поле заполнено неверно');
			setIsLoading(false);
			return;
		}

		const [apiResponse, apiErr] = await AuthService.loginStepOne(username, password);

		if (apiErr) {
			form.setFieldError('username', 'Неверный логин или пароль');
			form.setFieldError('password', 'Неверный логин или пароль');
			setIsLoading(false);
			return;
		}

		if (apiResponse) {
			if (apiResponse.isFired) {
				setIsLoading(false);
				form.setFieldError('username', 'Вы уволены');
				return;
			}

			if (apiResponse.isFirstLogin) {
				appActions.setAuthData({
					...auth,
					userId: apiResponse.id,
					username: apiResponse.username,
					firstName: apiResponse.firstName,
					lastName: apiResponse.lastName,
					color: apiResponse.color,
					photo: apiResponse.photo,
					phone: {
						voip: apiResponse.phoneVoip,
						mobile: apiResponse.phoneMobile,
					},
					roles: apiResponse.roles.map((role) => role.alias),
					isFired: apiResponse.isFired,
					step: 42,
				});
				setIsLoading(false);
				return;
			}

			setIsLoading(false);

			appActions.setAuthData({ ...auth, step: 2, username, password });
		}
	};

	return (
		<form
			onSubmit={form.onSubmit(handleSubmit)}
			autoComplete="off"
			className={css.stepOneWrapper}
			ref={focusTrapRef}
		>
			<Input
				size="large"
				label="Логин"
				name="username"
				id="username"
				placeholder="Введите логин..."
				required
				iconLeft={<Icon name="user" />}
				{...form.getInputProps('username')}
				className={css.inputLogin}
				focusTrapRef
				disabled={isLoading}
			/>

			<Input
				mode="password"
				size="large"
				label="Пароль "
				name="pwd"
				id="pwd"
				placeholder="Введите пароль..."
				iconLeft={<Icon name="password" />}
				required
				{...form.getInputProps('password')}
				className={css.inputPassword}
				disabled={isLoading}
			/>

			<Button
				size="extraLarge"
				color="primary"
				variant="hard"
				iconRight={<Icon name="arrow-medium" className={css.arrow} />}
				className={css.stepOneSubmit}
				type="submit"
				disabled={isLoading}
			>
				Далее
			</Button>
		</form>
	);
});
