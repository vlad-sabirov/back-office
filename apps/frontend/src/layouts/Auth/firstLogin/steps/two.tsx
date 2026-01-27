import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar, Button, TextField } from '@fsd/shared/ui-kit';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { ColorPicker } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AvatarDefaultColors } from '@fsd/shared/ui-kit/avatar-changer/common/AvatarColors';
import UserService from '../../../../services/User.service';
import { Context } from '../auth-first-login';
import css from '../auth-first-login.module.scss';
import Constants from '../auth.first.login.constants';

const Component = observer((): JSX.Element => {
	const { store } = useContext(Context);
	const form = useForm({
		initialValues: {
			color: '',
		},
	});

	useEffect(() => {
		if (store.user.color) form.setFieldValue('color', store.user.color);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { color } = form.values;

		if (!color.length) {
			form.setFieldError('color', Constants.VALIDATION.COLOR.EMPTY);
			return;
		}

		const dto: IUserUpdateDto = {
			userDto: {
				color,
			},
		};
		const [updatedUser] = await UserService.updateById(store.user.id, dto);
		if (updatedUser) {
			store.setUser(updatedUser);
			form.reset();
			store.setStep(3);
		}
	};

	return (
		<div>
			<TextField className={css.info} dangerouslySetInnerHTML={{ __html: Constants.TEXT.STEP_TWO }} />

			<div className={css.form__two}>
				<ColorPicker
					format="hex"
					withPicker={false}
					swatches={AvatarDefaultColors}
					fullWidth
					{...form.getInputProps('color')}
					className={css.color}
				/>

				<Avatar
					size="extraLarge"
					color={form.values.color}
					text={store.user.lastName[0] + store.user.firstName[0]}
					src={store.user.photo}
					className={css.avatar}
				/>
			</div>

			<div className={css.buttons}>
				<Button
					size="large"
					className={css.prev}
					onClick={() => {
						form.reset();
						store.setStep(1);
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
