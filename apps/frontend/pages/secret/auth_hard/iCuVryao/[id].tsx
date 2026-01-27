import { useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { LatenessService } from '@services';
import AuthService from '@services/Auth.service';
import UserService from '@services/User.service';

// http://localhost/secret/auth_hard/iCuVryao/hupxHCOO

// eslint-disable-next-line import/no-anonymous-default-export,react/display-name
export default (): JSX.Element => {
	const { query, push } = useRouter();
	const appActions = useAppActions();
	const auth = useStateSelector((state) => state.app.auth);

	useEffect(() => {
		if (!query.id) return;
		let isMounted = true;
		let userId = 0;
		if (query.id === 'hupxHCOO') userId = 1; // Басенко Дмитрий
		if (userId === 0) return;

		(async () => {
			const [findLateness] = await LatenessService.findFixLateness({ userId });
			if (!findLateness && Number(format(new Date(), 'HHmm')) > 905) {
				if (!isMounted) return;
				const [user] = await UserService.findById(userId);
				appActions.setAuth(false);
				appActions.setAuthData({
					...auth,
					step: 3,
					username: user?.username ?? null,
					hard: true,
				});
			} else {
				if (!isMounted) return;
				const [response] = await AuthService.hardLogin(String(userId));
				if (!findLateness) await AuthService.latenessFix(userId, '');
				if (!response) return;
				localStorage.setItem('accessToken', response.tokens.accessToken);
			}
			await push('/');
		})();

		return () => {
			isMounted = false;
		};
	}, [appActions, auth, push, query.id]);

	return <></>;
};
