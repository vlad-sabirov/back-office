import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';
import {
	CreateLatenessCommentRequest,
	FindLatenessCommentRequest,
	LatenessCommentResponse,
	UpdateLatenessCommentRequest,
} from '@interfaces';
import { ServiceResponse } from '@interfaces';

export class LatenessCommentService {
	/** -------
   * Создание комментария к опозданию
   ------- */
	static async create({
		createDto,
	}: {
		createDto: CreateLatenessCommentRequest;
	}): Promise<ServiceResponse<LatenessCommentResponse>> {
		let response, error;
		await $api
			.post('/lateness-comment', createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** -------
   * Поиск комментария по его ID
   ------- */
	static async findById(id: number | string): Promise<ServiceResponse<LatenessCommentResponse>> {
		let response, error;
		await $api
			.get('/lateness-comment/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** -------
   * Поиск одного комментария с произвольным фильтром
   ------- */
	static async findOnce({
		where,
		filter,
		include,
	}: {
		where: FindLatenessCommentRequest;
		filter?: PrismaFilterRequest<Omit<LatenessCommentResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<LatenessCommentResponse>> {
		let response, error;
		await $api
			.post('/lateness-comment/findOnce', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** -------
   * Поиск несколько комментариев с произвольным фильтром
   ------- */
	static async findMany({
		where,
		filter,
		include,
	}: {
		where: FindLatenessCommentRequest;
		filter?: PrismaFilterRequest<Omit<LatenessCommentResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<LatenessCommentResponse[]>> {
		let response, error;
		await $api
			.post('/lateness-comment/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** -------
   * Изменяет комментарий по его ID
   ------- */
	static async updateById({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: UpdateLatenessCommentRequest;
	}): Promise<ServiceResponse<LatenessCommentResponse>> {
		let response, error;
		await $api
			.patch('/lateness-comment/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** -------
   * Удаляет комментарий по его ID
   ------- */
	static async deleteById(id: number | string): Promise<ServiceResponse<LatenessCommentResponse>> {
		let response, error;
		await $api
			.delete('/lateness-comment/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
