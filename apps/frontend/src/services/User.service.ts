import { ServiceResponse } from '@interfaces';
import { IUserUpdateDto } from '@interfaces/user/UseUpdate.dto';
import { IUserAllInfoResponse } from '@interfaces/user/UserAllInfo.response';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { IUserRegistrationRequest } from '@interfaces/user/UserRegistration.request';
import { IUserRoleResponse } from '@interfaces/user/UserRole.response';
import { UserCountAllEntity } from '@screens/staff/interfaces/user-count-all.entity';
import $api from '../helpers/Api.http';

export default class UserService {
	/** @summary Регистрация пользователя @returns [response, error] */
	static async create(dto: IUserRegistrationRequest): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.post('/user/', dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск всех пользователей @returns [response[], error] */
	static async findAll(): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск всех пользователей @returns [response[], error] */
	static async findSeniorSales(): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/department/seniorSales')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск абсолютно всех пользователей @returns [response[], error] */
	static async findEverything(): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/everything')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск пользователя по ID @returns [response, error] */
	static async findById(id: number | string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.get('/user/find/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск пользователя по ID @returns [response, error] */
	static async findByIdMany(id: number[]): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.post('/user/find/byId/', { id })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск пользователя со всей информацией по ID @returns [response, error] */
	static async findAllInfoById(id: number): Promise<ServiceResponse<IUserAllInfoResponse>> {
		let response, error;
		await $api
			.get('/user/find/allInfoById/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск руководителя по ID подчиненного @returns [response[], error] */
	static async findParentByChildId(id: number): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/parentByChildId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск сотрудника по VOIP номеру @returns [response, error] */
	static async findByPhone(phone: string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.get('/user/find/byPhone/' + phone)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск сотрудника по VOIP номеру @returns [response, error] */
	static async findByVoip(voip: string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.get('/user/find/byVoip/' + voip)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск сотрудников по alias роли @returns [response[], error] */
	static async findByRole(role: string): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/byRole/' + role)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск всех ролей @returns [response[], error] */
	static async findAllRoles(): Promise<ServiceResponse<IUserRoleResponse[]>> {
		let response, error;
		await $api
			.get('/user-role/')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск пользователя по username @returns [response, error] */
	static async findByUsername(username: string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.get('/user/find/byUsername/' + username)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Ищет всех сотрудников своего отдела @returns [response[], error] */
	static async findMyTeamUsersId(userId: number | string): Promise<ServiceResponse<number[]>> {
		let response, error;
		await $api
			.get('/user/find/myTeamUsersId/' + userId)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Ищет всех сотрудников своего отдела @returns [response[], error] */
	static async findBirthdayUpcoming(count?: number | string): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/birthday/upcoming/' + count || String(3))
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Ищет всех сотрудников своего отдела @returns [response[], error] */
	static async findBirthdayToday(): Promise<ServiceResponse<IUserResponse[]>> {
		let response, error;
		await $api
			.get('/user/find/birthday/today/')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Ищет всех сотрудников своего отдела @returns [response[], error] */
	static async countAll(): Promise<ServiceResponse<UserCountAllEntity>> {
		let response, error;
		await $api
			.get('/user/find/count/all')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Валидация пользователя @returns [response, error] */
	static async validateUser(username: string, password: string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.post('/auth/validateUser/', { username, password })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Изменение пользователя по его ID @returns [response, error] */
	static async updateById(
		id: number,
		dto: IUserRegistrationRequest | IUserUpdateDto
	): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.patch('/user/byId/' + id, dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Изменение пароля по ID пользователя @returns [response, error] */
	static async updatePasswordByUserId(id: number, password: string): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.patch('/user/updatePasswordByUserId/' + id, { password })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Увольнение\Возвращение сотрудника по ID @returns [response, error] */
	static async updateFiredByUserId(id: number): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.patch('/user/updateFiredByUserId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Смена территории по ID сотрудника @returns [response, error] */
	static async updateTerritoryByUserId(id: number, territoryId: number): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.patch('/user/updateTerritoryByUserId/' + id, { territoryId })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Смена отдела по ID сотрудника @returns [response, error] */
	static async updateDepartmentByUserId(id: number, departmentId: number): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.patch('/user/updateDepartmentByUserId/' + id, { departmentId })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Удаление сотрудника по ID @returns [response, error] */
	static async deleteById(id: number): Promise<ServiceResponse<IUserResponse>> {
		let response, error;
		await $api
			.delete('/user/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
