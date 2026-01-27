import {useAppActions} from "@fsd/entities/app";
import AuthService from "@services/Auth.service";

export const useLogout = () => {
	const appActions = useAppActions();

	return async () => {
		try {
			await AuthService.logout();
			localStorage.removeItem('accessToken');
			appActions.setAuth(false);
			appActions.setAuthData(null);
			// eslint-disable-next-line no-empty
		} catch (error) {
		}
	};
}
