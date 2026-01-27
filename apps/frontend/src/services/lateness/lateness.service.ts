import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';
import { CreateLatenessRequest, FindLatenessRequest } from '@interfaces/lateness';
import { LatenessResponse, UpdateLatenessRequest } from '@interfaces/lateness';
import { ServiceResponse } from '@interfaces/service-fetch.response';

export class LatenessService {
	static async create({
		createDto,
	}: {
		createDto: CreateLatenessRequest;
	}): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.post('/lateness', createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number | string): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.get('/lateness/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findOnce({
		where,
		filter,
		include,
	}: {
		where: FindLatenessRequest;
		filter?: PrismaFilterRequest<Omit<LatenessResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.post('/lateness/findOnce', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findMany({
		where,
		filter,
		include,
	}: {
		where: FindLatenessRequest;
		filter?: PrismaFilterRequest<Omit<LatenessResponse, 'user'>>;
		include?: Record<string, unknown>;
	}): Promise<ServiceResponse<LatenessResponse[]>> {
		let response, error;
		await $api
			.post('/lateness/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findWithPass({
		where,
		filter,
		include,
	}: {
		where: FindLatenessRequest;
		filter?: PrismaFilterRequest<Omit<LatenessResponse, 'user'>>;
		include?: Record<string, unknown>;
	}): Promise<ServiceResponse<LatenessResponse[]>> {
		let response, error;
		await $api
			.post('/lateness/findWithPass', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findFixLateness({
		userId,
		date,
		withoutFilter,
	}: {
		userId: number;
		date?: Date;
		withoutFilter?: boolean;
	}): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.post('/lateness/findFixLateness', { userId, date, withoutFilter })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: UpdateLatenessRequest;
	}): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.patch('/lateness/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number | string): Promise<ServiceResponse<LatenessResponse>> {
		let response, error;
		await $api
			.delete('/lateness/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
