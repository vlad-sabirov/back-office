import { FC, useContext, useEffect, useState } from 'react';
import { AdminContext } from 'layouts/AdminSpotlight/AuthSpotlight';
import { observer } from 'mobx-react-lite';
import { setCookie } from 'react-use-cookie';
import { InputOtp, Modal } from '@fsd/shared/ui-kit';
import css from './style.module.scss';

export const Auth: FC = observer(() => {
	const Store = useContext(AdminContext);
	const [password, setPassword] = useState<string>();

	const handleClose = () => {
		Store.modalOpen('authAdmin', false);
	};

	useEffect(() => {
		if (password?.length === 7 && password === '3121722') {
			setCookie('isAdmin', 'true', { days: 1 });
			Store.isAuth = true;
			Store.modalOpen(Store.openedModalAfterAuth as keyof typeof Store.modals, true);
			handleClose();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [password]);

	return (
		<Modal title="Докажи что админ" opened={Store.modals.authAdmin} onClose={handleClose} size={520}>
			<div className={css.root}>
				<InputOtp
					length={7}
					size="large"
					className={css.input}
					isInputSecure={true}
					value={password}
					onChange={(event) => setPassword(event)}
				/>
			</div>
		</Modal>
	);
});
