import {useAppActions} from "@fsd/entities/app";
import AuthService from "@services/Auth.service";
import UserService from "@services/User.service";

export const useLogin = () => {
	const appActions = useAppActions();

	return async ({ username, password, pinCode, isHardLogin, hardLoginUserId }: {
		username: string;
		password: string;
		pinCode: number;
		isHardLogin?: boolean;
		hardLoginUserId?: number;
	}) => {
		const [response, error] =
			isHardLogin && hardLoginUserId
				? await AuthService.hardLogin(String(hardLoginUserId))
				: await AuthService.login(username, password, pinCode);
		if (response) {
			const responseUser = response.user;
			if (responseUser.id) {
				appActions.setAuth(true);
				const [user] = await UserService.findById(responseUser.id);
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
					pinCode,
					step: 1,
					hard: isHardLogin,
				});
			}

			if (response.tokens.accessToken) {
				localStorage.setItem('accessToken', response.tokens.accessToken);
			}

			return;
		}

		if (error) {
			appActions.setAuth(false);
			appActions.setAuthData(null);
		}
	};
}
