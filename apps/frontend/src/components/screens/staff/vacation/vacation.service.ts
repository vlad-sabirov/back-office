import { CreateVacationRequest, FindVacationRequest, UpdateVacationRequest, VacationResponse } from './interfaces';
import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';
import { ServiceResponse } from '@interfaces/service-fetch.response';

export class VacationService {
	static async create(data: CreateVacationRequest): Promise<ServiceResponse<VacationResponse>> {
		let response, error;
		await $api
			.post('/vacation-calendar', data)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number | string): Promise<ServiceResponse<VacationResponse>> {
		let response, error;
		await $api
			.get('/vacation-calendar/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async finOnce(
		where: FindVacationRequest,
		filter?: PrismaFilterRequest<Omit<VacationResponse, 'user'>>,
		include?: Record<string, boolean>
	): Promise<ServiceResponse<VacationResponse>> {
		let response, error;
		await $api
			.post('/vacation-calendar/findOnce', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findMany(
		where: FindVacationRequest,
		filter?: PrismaFilterRequest<Omit<VacationResponse, 'user'>>,
		include?: Record<string, boolean>
	): Promise<ServiceResponse<VacationResponse[]>> {
		let response, error;
		await $api
			.post('/vacation-calendar/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findBetweenDateRange({
		start,
		end,
		userId,
	}: {
		start: Date;
		end: Date;
		userId?: number | string;
	}): Promise<ServiceResponse<{ userId: number; dates: string[] }[]>> {
		let response, error;
		await $api
			.post('/vacation-calendar/findBetweenDateRange', { start, end, userId })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		id: number | string,
		data: UpdateVacationRequest
	): Promise<ServiceResponse<VacationResponse>> {
		let response, error;
		await $api
			.patch('/vacation-calendar/byId/' + id, data)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number | string): Promise<ServiceResponse<VacationResponse>> {
		let response, error;
		await $api
			.delete('/vacation-calendar/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
