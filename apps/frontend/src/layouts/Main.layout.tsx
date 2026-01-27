import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { Loader } from '@mantine/core';
import { AuthLayout } from './Auth/AuthLayout';
import { StructureLayout } from './Structure/Structure.layout';
import { MainLayoutProps } from './Main.layout.props';
import { useAppActions } from '@fsd/entities/app';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useCheckAuth } from './lib/use-check-auth';
import { useLogout } from './lib/use-logout';

export const MainLayout = observer(function ({ children }: MainLayoutProps): JSX.Element {
	const { route } = useRouter();
	const actions = useAppActions();
	const isLoading = useStateSelector((state) => state.app.auth.isLoading)
	const isAuth = useStateSelector((state) => state.app.auth.isAuth)
	const isFired = useStateSelector((state) => state.app.auth.isFired)
	const checkAuth = useCheckAuth();
	const logout = useLogout();

	useEffect(() => {
		let isMounted = true;

		(async function () {
			if (localStorage.getItem('accessToken') && !isAuth && isMounted) await checkAuth();
			if (isMounted) actions.setAuthIsLoading(false);
		})();

		return () => { isMounted = false; };
	}, [actions, checkAuth, isAuth]);

	if (isLoading) {
		return (
			<div className="pageLoading">
				<Loader size="xl" variant="bars" />
			</div>
		);
	}
		
		
	if (!isAuth && !route.includes('secret/auth_hard')) return <AuthLayout />;
		
	if (isFired) logout();
		
	return (
		<StructureLayout>
			{children}
		</StructureLayout>
	);
});
