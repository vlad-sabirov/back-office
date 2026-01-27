import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, TextField, Textarea } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { useFocusTrap } from '@mantine/hooks';
import AuthService from '@services/Auth.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';
import css from './../Styles.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAppActions } from '@fsd/entities/app';
import { useLogin } from '@layouts/lib/use-login';

export const AuthLayoutStopThree = observer((): JSX.Element => {
	const focusTrapRef = useFocusTrap();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const form = useForm({
		initialValues: {
			comment: '',
		},
	});

	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();
	const login = useLogin();

	const handleSubmit = async () => {
		if (!auth) return;
		const { comment } = form.values;
		setIsLoading(true);

		if (comment.length < 4) {
			form.setFieldError('comment', 'Неверно указана причина опоздания');
			setIsLoading(false);
			return;
		}

		const [findUser] = await UserService.findByUsername(auth?.username as string);
		if (!findUser) {
			setIsLoading(false);
			return;
		}

		await AuthService.latenessFix(findUser.id, comment);

		await login({
			username: auth.username as string,
			password: auth.password as string,
			pinCode: Number(auth?.pinCode),
			isHardLogin: auth.hard,
			hardLoginUserId: auth.hard ? findUser.id : undefined,
		});
		appActions. setAuthData({ ...auth, step: 1 });
		await NotificationService.cronIsLate(findUser.id);
		setIsLoading(false);
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={css.stepThreeWrapper} ref={focusTrapRef}>
			<TextField className={css.stepThreeDescription}>
				Вы пришли на работу позже положенного. В текстовом поле ниже обязательно укажите причину опоздания.
			</TextField>

			<Textarea
				size="large"
				label="Причина опоздания"
				className={css.stepThreeInput}
				{...form.getInputProps('comment')}
				disabled={isLoading}
				data-autofocus
				required
			/>

			<Button
				size="extraLarge"
				color="warning"
				variant="hard"
				iconRight={<Icon name="alert" />}
				className={css.stepThreeSubmit}
				type="submit"
				disabled={isLoading}
			>
				Зафиксировать
			</Button>
		</form>
	);
});
