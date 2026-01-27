import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, TextField } from '@fsd/shared/ui-kit';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { useForm } from '@mantine/form';
import AuthService from '@services/Auth.service';
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
			newPassword: '',
			confirmPassword: '',
		},
	});
	const auth = useStateSelector((state) => state.app.auth);
	const appActions = useAppActions();

	const onSubmit = async () => {
		const { newPassword, confirmPassword } = form.values;

		if (newPassword.length < 8 || newPassword.length > 64) {
			form.setFieldError('newPassword', Constants.VALIDATION.PASSWORD.WRONG_LENGTH);
			return;
		}

		if (confirmPassword.length < 8 || confirmPassword.length > 64) {
			form.setFieldError('confirmPassword', Constants.VALIDATION.PASSWORD.WRONG_LENGTH);
			return;
		}

		if (newPassword !== confirmPassword) {
			form.setFieldError('newPassword', Constants.VALIDATION.PASSWORD.DO_NOT_MATCH);
			form.setFieldError('confirmPassword', Constants.VALIDATION.PASSWORD.DO_NOT_MATCH);
			return;
		}

		const dto: IUserUpdateDto = {
			userDto: {
				password: newPassword,
				isFirstLogin: false,
			},
		};
		const [updatedUser] = await UserService.updateById(store.user.id, dto);
		if (updatedUser) {
			store.setUser(updatedUser);
			form.reset();
			store.setStep(1);
			appActions.setAuthData({
				...auth,
				step: 2,
				username: store.user.username,
				password: newPassword
			});
		}

		await AuthService.loginStepOne(store.user.username, newPassword);
	};

	return (
		<div>
			<TextField className={css.info} dangerouslySetInnerHTML={{ __html: Constants.TEXT.STEP_FOUR }} />

			<div className={css.form__four}>
				<Input label="Новый пароль" mode="password" {...form.getInputProps('newPassword')} required />
				<Input label="Повторите пароль" mode="password" {...form.getInputProps('confirmPassword')} required />
			</div>

			<div className={css.buttons}>
				<Button
					size="large"
					className={css.prev}
					onClick={() => {
						form.reset();
						store.setStep(3);
					}}
				>
					{Constants.BUTTON.PREV}
				</Button>
				<Button color="primary" variant="hard" size="large" className={css.next} onClick={onSubmit}>
					{Constants.BUTTON.FINISH}
				</Button>
			</div>
		</div>
	);
});

export default Component;
