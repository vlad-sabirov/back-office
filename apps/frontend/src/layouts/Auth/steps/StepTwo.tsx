import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useClient } from '@fsd/shared/lib/hooks/use-client/use-client';
import { Button, Icon, InputOtp, TextField } from '@fsd/shared/ui-kit';
import { useLogin } from '@layouts/lib/use-login';
import { useForm } from '@mantine/form';
import { useFocusTrap } from '@mantine/hooks';
import AuthService from '@services/Auth.service';
import UserService from '@services/User.service';
import css from './../Styles.module.scss';

export const AuthLayoutStopTwo = observer((): JSX.Element => {
	const focusTrapRef = useFocusTrap();
	const form = useForm({
		initialValues: {
			pinCode: '',
		},
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();
	const login = useLogin();
	const { skipLateness } = useClient();
	const autoSubmitted = useRef(false);

	// Авто-заполнение и авто-отправка при отключённом боте
	useEffect(() => {
		if (auth.pinCode && auth.pinCode !== 0 && !autoSubmitted.current) {
			autoSubmitted.current = true;
			form.setFieldValue('pinCode', String(auth.pinCode));
			setTimeout(() => handleSubmit(String(auth.pinCode)), 100);
		}
	}, [auth.pinCode]);

	const handleSubmit = async (overridePinCode?: string) => {
		const pinCode = overridePinCode || form.values.pinCode;
		setIsLoading(true);

		if (pinCode.length < 6) {
			form.setFieldError('pinCode', 'Указан неверный код');
			setIsLoading(false);
			return;
		}

		const [apiResponse, apiErr] = await AuthService.loginStepTwo(
			auth?.username as string,
			auth?.password as string,
			Number(pinCode)
		);

		if (apiErr && apiErr.statusCode === 404 && apiErr.message === 'Указан неверный PIN код') {
			form.setFieldError('pinCode', 'Указан неверный код');
			setIsLoading(false);
			return;
		}

		if (!auth.username) return;
		const [userResponse] = await UserService.findByUsername(auth.username);
		if (!skipLateness && userResponse?.isFixLate && apiResponse && !apiResponse.isFix && apiResponse.lateness) {
			if (apiResponse)
				appActions.setAuthData({
					...auth,
					step: 3,
					username: auth?.username,
					password: auth?.password,
					pinCode,
				});
			setIsLoading(false);
			return;
		}

		setIsLoading(false);
		await login({
			username: auth?.username as string,
			password: auth?.password as string,
			pinCode: Number(pinCode),
		});
		appActions.setAuthData({ ...auth, step: 1 });
	};

	return (
		<form onSubmit={form.onSubmit(() => handleSubmit())} className={css.stepTwoWrapper} ref={focusTrapRef}>
			<TextField className={css.stepTwoDescription}>
				На Ваш Telegram бы отправлен код подтверждения авторизации, состоящий из 6 цифр. Для того, чтобы войти в
				систему введите полученный код в форму ниже.
			</TextField>

			<InputOtp
				length={6}
				{...form.getInputProps('pinCode')}
				className={css.pinCode}
				size="large"
				disabled={isLoading}
				data-autofocus
			/>

			<Button
				size="extraLarge"
				color="primary"
				variant="hard"
				iconRight={<Icon name="user" />}
				className={css.stepTwoSubmit}
				type="submit"
				disabled={isLoading}
			>
				Войти
			</Button>
		</form>
	);
});
