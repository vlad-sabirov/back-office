import {
	CreateProductCalendarRequest,
	FilterProductCalendarRequest,
	ProductionCalendarResponse,
	UpdateProductCalendarRequest,
} from './dto';
import $api from '@helpers/Api.http';
import { PrismaSortRequest } from '@interfaces/prisma-sort.request';
import { ServiceResponse } from '@interfaces/service-fetch.response';

export default class ProductionCalendarService {
	static async create(dto: CreateProductCalendarRequest): Promise<ServiceResponse<ProductionCalendarResponse>> {
		let response, error;
		await $api
			.post('/production-calendar', dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number | string): Promise<ServiceResponse<ProductionCalendarResponse>> {
		let response, error;
		await $api
			.get('/production-calendar/findById/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findOnce(
		filter: FilterProductCalendarRequest,
		sort?: PrismaSortRequest
	): Promise<ServiceResponse<ProductionCalendarResponse>> {
		let response, error;
		await $api
			.post('/production-calendar/findOnce', { filter, sort })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findMany(
		filter: FilterProductCalendarRequest,
		sort?: PrismaSortRequest
	): Promise<ServiceResponse<ProductionCalendarResponse[]>> {
		let response, error;
		await $api
			.post('/production-calendar/findMany', { filter, sort })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findBetweenDateRange({ start, end }: { start: Date; end: Date }): Promise<ServiceResponse<string[]>> {
		let response, error;
		await $api
			.post('/production-calendar/findBetweenDateRange', { start, end })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		id: number | string,
		dto: UpdateProductCalendarRequest
	): Promise<ServiceResponse<ProductionCalendarResponse>> {
		let response, error;
		await $api
			.patch('/production-calendar/byId/' + id, dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number | string): Promise<ServiceResponse<ProductionCalendarResponse[]>> {
		let response, error;
		await $api
			.delete('/production-calendar/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async hideById(id: number | string): Promise<ServiceResponse<ProductionCalendarResponse[]>> {
		let response, error;
		await $api
			.delete('/production-calendar/hideById/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
