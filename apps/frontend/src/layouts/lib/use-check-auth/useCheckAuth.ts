import {useAppActions} from "@fsd/entities/app";
import AuthService from "@services/Auth.service";
import UserService from "@services/User.service";

export const useCheckAuth = () => {
	const appActions = useAppActions();

	return async () => {
		const [response, error] = await AuthService.checkAuth(localStorage.getItem('accessToken') as string);

		if (response) {
			if (response.id) {
				appActions.setAuth(true);
				const [user] = await UserService.findById(response.id);
				if (!user) {
					return;
				}
				const [team] = await UserService.findMyTeamUsersId(user.id);
				if (!team) {
					return;
				}

				appActions.setAuthData({
					userId: user.id,
					parentId: user.parent?.id || null,
					username: user.username,
					password: user.password,
					firstName: user.firstName,
					lastName: user.lastName,
					color: user.color,
					photo: user.photo,
					team: team,
					roles: user.roles.map((role) => role.alias),
					phone: {
						mobile: user.phoneMobile,
						voip: user.phoneVoip,
					},
					isFired: user.isFired,
					pinCode: null,
					step: 1,
				});
			}

			if (response.accessToken) {
				localStorage.setItem('accessToken', response.accessToken);
			}

			return;
		}

		if (error) {
			appActions.setAuth(false);
			appActions.setAuthData(null);
		}
	};
}
