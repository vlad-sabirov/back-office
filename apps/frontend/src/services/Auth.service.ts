import { ServiceResponse } from '@interfaces';
import { LoginEntity, LoginEntityPayload } from '@layouts/Auth/entity/Login.entity';
import { LatenessFixResponse } from '@layouts/Auth/interfaces/LatenessFix.response';
import { LoginStepOneResponse } from '@layouts/Auth/interfaces/LoginStopOne.response';
import { LoginStepTwoResponse } from '@layouts/Auth/interfaces/LoginStopTwo.response';
import $api from '../helpers/Api.http';

export default class AuthService {
	/** @summary Авторизация @returns [response, error] */
	static async login(username: string, password: string, pinCode: number): Promise<ServiceResponse<LoginEntity>> {
		let response, error;
		await $api
			.post<LoginEntity>('/auth/login', { username, password, pinCode })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async hardLogin(id: number | string): Promise<ServiceResponse<LoginEntity>> {
		let response, error;
		await $api
			.get<LoginEntity>('/auth/secret/hardLogin/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Авторизация. Шаг 1 @returns [response, error] */
	static async loginStepOne(username: string, password: string): Promise<ServiceResponse<LoginStepOneResponse>> {
		let response, error;
		await $api
			.post<LoginStepOneResponse>('/auth/login/stepOne', { username, password })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Авторизация. Шаг 2 @returns [response, error] */
	static async loginStepTwo(
		username: string,
		password: string,
		pinCode: number
	): Promise<ServiceResponse<LoginStepTwoResponse>> {
		let response, error;
		await $api
			.post<LoginStepOneResponse>('/auth/login/stepTwo', { username, password, pinCode })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Фиксация опоздавших @returns [response, error] */
	static async latenessFix(userId: number, comment: string): Promise<ServiceResponse<LatenessFixResponse>> {
		let response, error;
		await $api
			.post<LatenessFixResponse>('/auth/lateness/fix', { userId, comment })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Проверка авторизации @returns [response, error] */
	static async checkAuth(accessToken: string): Promise<ServiceResponse<LoginEntityPayload>> {
		let response, error;
		await $api
			.post<LoginEntityPayload>('/auth/checkAuth', { accessToken })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Выход из системы @returns [void, error] */
	static async logout(): Promise<ServiceResponse<void>> {
		let response, error;
		await $api
			.get('/auth/logout')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
