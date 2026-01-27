import { makeAutoObservable } from 'mobx';
import { AuthEntity } from '@layouts/Auth/entity/Auth.entity';
import { LoginEntityPayload } from '@layouts/Auth/entity/Login.entity';
import AuthService from '../services/Auth.service';
import UserService from '../services/User.service';

export default class AuthStore {
	isAuth = false;
	isLoading = true;
	auth: AuthEntity = { step: 1 };
	user: LoginEntityPayload = {} as LoginEntityPayload;
	team: number[] = [];

	constructor() {
		makeAutoObservable(this);
	}

	setAuth(bool: boolean): void {
		this.isAuth = bool;
	}

	setLoading(bool: boolean): void {
		this.isLoading = bool;
	}

	setAuthStep(dto: AuthEntity) {
		this.auth = dto;
	}

	setUser(dto: LoginEntityPayload) {
		this.user = dto;
	}

	setTeam(value: number[]) {
		this.team = value;
	}

	async login({
		username,
		password,
		pinCode,
		isHardLogin,
		hardLoginUserId,
	}: {
		username: string;
		password: string;
		pinCode: number;
		isHardLogin?: boolean;
		hardLoginUserId?: number;
	}) {
		const [response, error] =
			isHardLogin && hardLoginUserId
				? await AuthService.hardLogin(String(hardLoginUserId))
				: await AuthService.login(username, password, pinCode);

		if (response) {
			localStorage.setItem('accessToken', response.tokens.accessToken);
			this.setAuth(true);
			this.setUser(response.user);
			const [team] = await UserService.findMyTeamUsersId(response.user.id);
			if (team) this.setTeam(team);
			return { data: response.user };
		}

		if (error) {
			return { error };
		}
	}

	async checkAuth() {
		const [response, error] = await AuthService.checkAuth(localStorage.getItem('accessToken') as string);

		if (response) {
			if (response.id) {
				this.setAuth(true);
				const [user] = await UserService.findById(response.id);

				if (user) {
					this.setUser({
						id: user.id,
						username: user.username,
						color: user.color,
						photo: user.photo,
						firstName: user.firstName,
						lastName: user.lastName,
						phoneVoip: Number(user.phoneVoip),
						phoneMobile: Number(user.phoneMobile),
						roles: user.roles.map((role) => role.alias),
						parent: user.parent?.id || undefined,
						child: user.child?.length ? user.child.map((child) => child.id) : undefined,
						isFired: user.isFired,
					});

					const [team] = await UserService.findMyTeamUsersId(user.id);
					if (team) this.setTeam(team);
				}
			}

			if (response.accessToken) {
				localStorage.setItem('accessToken', response.accessToken);
			}

			return;
		}

		if (error) {
			this.setAuth(false);
			this.setUser({} as LoginEntityPayload);
		}
	}

	async logout() {
		try {
			await AuthService.logout();
			localStorage.removeItem('accessToken');
			this.setAuth(false);
			this.setUser({} as LoginEntityPayload);
			// eslint-disable-next-line no-empty
		} catch (error) {}
	}
}
