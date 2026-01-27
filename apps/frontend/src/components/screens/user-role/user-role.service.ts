import $api from '@helpers/Api.http';
import { IFetchError } from '@interfaces/fetch-error.interface';
import { ServiceResponse } from '@interfaces/service-fetch.response';
import ICreateUserRoleDto from '@interfaces/user-role/create-user-role.dto';
import IUpdateUserRoleDto from '@interfaces/user-role/update-user-role.dto';
import { IUserRoleResponse } from '@interfaces/user/UserRole.response';

export default class UserRoleService {
	/**
	 * @summary Создание роли
	 * @returns [response, error]
	 */
	static async create(dto: ICreateUserRoleDto): Promise<ServiceResponse<IUserRoleResponse>> {
		let response, error;
		await $api
			.post('/user-role/', dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/**
	 * @summary Поиск всех ролей
	 * @returns [response[], error]
	 */
	static async findAllRoles(): Promise<ServiceResponse<IUserRoleResponse[]>> {
		let response, error;
		await $api
			.get('/user-role/')
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/**
	 * @summary Поиск роли по alias
	 * @returns [response, error]
	 */
	static async findByAlias(alias: string): Promise<ServiceResponse<IUserRoleResponse>> {
		let response, error;
		await $api
			.get('/user-role/byAlias/' + alias)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/**
	 * @summary Изменение роли
	 * @returns [response, error]
	 */
	static async updateById(id: number | string, dto: IUpdateUserRoleDto): Promise<ServiceResponse<IUserRoleResponse>> {
		let response, error;
		await $api
			.patch('/user-role/byId/' + id, dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/**
	 * @summary Массовое изменение ролей сотрудников
	 * @returns error
	 */
	static async updateRoleStaff(roleId: number | string, dto: number[] | string[]): Promise<IFetchError | undefined> {
		let error;
		await $api.patch('/user-role/staffByRoleId/' + roleId, dto).catch((err) => (error = err.response.data));
		return error;
	}

	/**
	 * @summary Удаление роли по id
	 * @returns [response, error]
	 */
	static async deleteById(id: string | number): Promise<ServiceResponse<IUserRoleResponse>> {
		let response, error;
		await $api
			.delete('/user-role/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
