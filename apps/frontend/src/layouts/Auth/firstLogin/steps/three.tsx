import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, InputNumber, TextField } from '@fsd/shared/ui-kit';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { useForm } from '@mantine/form';
import UserService from '../../../../services/User.service';
import { Context } from '../auth-first-login';
import css from '../auth-first-login.module.scss';
import Constants from '../auth.first.login.constants';

const Component = observer((): JSX.Element => {
	const { store } = useContext(Context);
	const form = useForm({
		initialValues: {
			phoneVoip: 0,
			phoneMobile: 0,
			email: '',
			telegram: '',
			facebook: '',
			instagram: '',
		},
	});

	useEffect(() => {
		if (store.user.phoneVoip) form.setFieldValue('phoneVoip', Number(store.user.phoneVoip));
		if (store.user.phoneMobile) form.setFieldValue('phoneMobile', Number(store.user.phoneMobile));
		if (store.user.email) form.setFieldValue('email', store.user.email);
		if (store.user.telegram) form.setFieldValue('telegram', store.user.telegram);
		if (store.user.facebook) form.setFieldValue('facebook', store.user.facebook);
		if (store.user.instagram) form.setFieldValue('instagram', store.user.instagram);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { phoneVoip, phoneMobile, email, telegram, facebook, instagram } = form.values;

		if (String(phoneVoip).length !== 3) {
			form.setFieldError('phoneVoip', Constants.VALIDATION.PHONE_VOIP.WRONG_LENGTH);
			return;
		} else {
			const [findDuplicate] = await UserService.findByVoip(String(phoneVoip));
			if (findDuplicate && findDuplicate.id !== store.user.id) {
				form.setFieldError('phoneVoip', Constants.VALIDATION.PHONE_VOIP.DUPLICATE_FOUND);
				return;
			}
		}

		if (String(phoneMobile).length !== 12) {
			form.setFieldError('phoneMobile', Constants.VALIDATION.PHONE_MOBILE.WRONG_LENGTH);
			return;
		}

		// noinspection RegExpRedundantEscape
		if (
			!email.match(
				// eslint-disable-next-line max-len, no-useless-escape
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
		) {
			form.setFieldError('email', Constants.VALIDATION.EMAIL.WRONG_FORMAT);
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
		const [updatedUser] = await UserService.updateById(store.user.id, dto);
		if (updatedUser) {
			store.setUser(updatedUser);
			form.reset();
			store.setStep(4);
		}
	};

	return (
		<div>
			<TextField className={css.info} dangerouslySetInnerHTML={{ __html: Constants.TEXT.STEP_THREE }} />

			<div className={css.form__three}>
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

			<div className={css.buttons}>
				<Button
					size="large"
					className={css.prev}
					onClick={() => {
						form.reset();
						store.setStep(2);
					}}
				>
					{Constants.BUTTON.PREV}
				</Button>
				<Button color="primary" variant="hard" size="large" className={css.next} onClick={onSubmit}>
					{Constants.BUTTON.NEXT}
				</Button>
			</div>
		</div>
	);
});

export default Component;
