import { AxiosResponse } from 'axios';
import { ServiceResponse } from '@interfaces/service-fetch.response';
import { ILogisticVedCommentResponse } from '@screens/logistic/ved/interfaces/LogisticVedComment.response';
import { ILogisticVedCommentCreateDto } from '@screens/logistic/ved/interfaces/LogisticVedCommentCreate.dto';
import { ILogisticVedCommentUpdateDto } from '@screens/logistic/ved/interfaces/LogisticVedCommentUpdate.dto';
import { ILogisticVedFileResponse } from '@screens/logistic/ved/interfaces/LogisticVedFile.response';
import { ILogisticVedFileCreateDto } from '@screens/logistic/ved/interfaces/LogisticVedFileCreate.dto';
// eslint-disable-next-line max-len
import { LogisticVedFindStageWithOrderOptionDto } from '@screens/logistic/ved/interfaces/LogisticVedFindStageWithOrderOption.dto';
import { ILogisticVedHistoryResponse } from '@screens/logistic/ved/interfaces/LogisticVedHistory.response';
import { ILogisticVedHistoryCreateDto } from '@screens/logistic/ved/interfaces/LogisticVedHistoryCreate.dto';
import { ILogisticVedOrderResponse } from '@screens/logistic/ved/interfaces/LogisticVedOrder.response';
import { ILogisticVedOrderCreateDto } from '@screens/logistic/ved/interfaces/LogisticVedOrderCreate.dto';
import { ILogisticVedOrderUpdateDto } from '@screens/logistic/ved/interfaces/LogisticVedOrderUpdate.dto';
import { ILogisticVedStageResponse } from '@screens/logistic/ved/interfaces/LogisticVedStage.response';
import { ILogisticVedStageCreateDto } from '@screens/logistic/ved/interfaces/LogisticVedStageCreate.dto';
import { ILogisticVedStageResortDto } from '@screens/logistic/ved/interfaces/LogisticVedStageResort.dto';
import { ILogisticVedStageUpdateDto } from '@screens/logistic/ved/interfaces/LogisticVedStageUpdate.dto';
import $api from '../helpers/Api.http';

export default class LogisticService {
	/**********************/
	/**********************/
	/******* Заявки *******/
	/**********************/
	/**********************/
	static async createOrder(dto: ILogisticVedOrderCreateDto): Promise<AxiosResponse<ILogisticVedOrderResponse>> {
		return $api.post('/logistic-ved-order', dto);
	}

	static async findOrderById(id: number | string): Promise<AxiosResponse<ILogisticVedOrderResponse | null>> {
		return $api.get('/logistic-ved-order/byId/' + id).catch((error) => error.response);
	}

	/** @summary Поиск активных заявок по userId @returns [response, error] */
	static async findActive(
		userId?: number | string | number[] | string[]
	): Promise<ServiceResponse<ILogisticVedOrderResponse[]>> {
		let response, error;
		await $api
			.post('/logistic-ved-order/findActive/', { userId })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Поиск активных заявок по userId @returns [response, error] */
	static async findActiveWithRole(
		role: 'logisticVedOrdersAuthor' | 'logisticVedOrdersCalculate' | 'logisticVedOrdersVed'
	): Promise<ServiceResponse<ILogisticVedOrderResponse[]>> {
		let response, error;
		await $api
			.get('/logistic-ved-order/findActiveWithRole/' + role)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateOrderById(
		id: string | number,
		dto: ILogisticVedOrderUpdateDto
	): Promise<AxiosResponse<ILogisticVedOrderResponse>> {
		return $api.patch('/logistic-ved-order/byId/' + Number(id), dto).catch((error) => error.response);
	}

	/**********************/
	/**********************/
	/******* Стадии *******/
	/**********************/
	/**********************/
	static async createStage(dto: ILogisticVedStageCreateDto): Promise<ServiceResponse<ILogisticVedStageResponse>> {
		let response, error;
		await $api
			.post('/logistic-ved-stage', dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findStageAll(): Promise<AxiosResponse<ILogisticVedStageResponse[] | null>> {
		return $api.get('/logistic-ved-stage');
	}

	static async findStageWithOrderOptions(
		options: LogisticVedFindStageWithOrderOptionDto
	): Promise<AxiosResponse<ILogisticVedStageResponse[] | null>> {
		return $api.post('/logistic-ved-stage/findWithActiveOrders', options);
	}

	static async findStageById(id: number | string): Promise<AxiosResponse<ILogisticVedStageResponse | null>> {
		return $api.get('/logistic-ved-stage/byId/' + id).catch((error) => error.response);
	}

	static async findStageByName(name: string): Promise<AxiosResponse<ILogisticVedStageResponse>> {
		return $api.get('/logistic-ved-stage/byName/' + name).catch((error) => error.response);
	}

	static async findStageByAlias(alias: string): Promise<AxiosResponse<ILogisticVedStageResponse>> {
		return $api.get('/logistic-ved-stage/byAlias/' + alias).catch((error) => error.response);
	}

	static async findStageNextPosition(id: number): Promise<AxiosResponse<ILogisticVedStageResponse>> {
		return $api.get('/logistic-ved-stage/nextPositionById/' + id).catch((error) => error.response);
	}

	static async findStagePrevPosition(id: number): Promise<ServiceResponse<ILogisticVedStageResponse>> {
		let response, error;
		await $api
			.get('/logistic-ved-stage/prevPositionById/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateStageById(
		id: string | number,
		dto: ILogisticVedStageUpdateDto
	): Promise<AxiosResponse<ILogisticVedStageResponse | null>> {
		return $api.patch('/logistic-ved-stage/byId/' + id, dto);
	}

	static async resortStage(
		dto: ILogisticVedStageResortDto[]
	): Promise<AxiosResponse<ILogisticVedStageResponse | null>> {
		return $api.patch('/logistic-ved-stage/resort', dto);
	}

	static async deleteStageById(id: string | number): Promise<AxiosResponse<ILogisticVedStageResponse | null>> {
		return $api.delete('/logistic-ved-stage/byId/' + id).catch((error) => error.response);
	}

	/***************************/
	/***************************/
	/******* Комментарии *******/
	/***************************/
	/***************************/
	static async createComment(dto: ILogisticVedCommentCreateDto): Promise<AxiosResponse<ILogisticVedCommentResponse>> {
		return $api.post('/logistic-ved-comment', dto);
	}

	static async findCommentAll(): Promise<AxiosResponse<ILogisticVedCommentResponse[] | null>> {
		return $api.get('/logistic-ved-comment');
	}

	static async findCommentById(id: string | number): Promise<AxiosResponse<ILogisticVedCommentResponse | null>> {
		return $api.get('/logistic-ved-comment/byId/' + id).catch((error) => error.response);
	}

	static async findCommentByAuthorId(
		authorId: string | number
	): Promise<AxiosResponse<ILogisticVedCommentResponse[] | null>> {
		return $api.get('/logistic-ved-comment/byAuthorId/' + authorId).catch((error) => error.response);
	}

	static async findCommentByOrderId(
		orderId: string | number
	): Promise<AxiosResponse<ILogisticVedCommentResponse[] | null>> {
		return $api.get('/logistic-ved-comment/byOrderId/' + orderId).catch((error) => error.response);
	}

	static async updateCommentById(
		id: string | number,
		dto: ILogisticVedCommentUpdateDto
	): Promise<AxiosResponse<ILogisticVedCommentResponse | null>> {
		return $api.patch('/logistic-ved-comment/byId/' + id, dto).catch((error) => error.response);
	}

	static async deleteCommentById(id: string | number): Promise<AxiosResponse<ILogisticVedCommentResponse | null>> {
		return $api.delete('/logistic-ved-comment/byId/' + id).catch((error) => {
			return error.response;
		});
	}

	/***********************/
	/***********************/
	/******* Истории *******/
	/***********************/
	/***********************/
	static async createHistory(dto: ILogisticVedHistoryCreateDto): Promise<AxiosResponse<ILogisticVedHistoryResponse>> {
		return $api.post('/logistic-ved-history', dto);
	}

	static async findHistoryAll(): Promise<AxiosResponse<ILogisticVedHistoryResponse[]>> {
		return $api.get('/logistic-ved-history');
	}

	static async findHistoryById(id: number | string): Promise<AxiosResponse<ILogisticVedHistoryResponse>> {
		return $api.get('/logistic-ved-history/byId/' + id).catch((error) => error.response);
	}

	static async findHistoryByOrderId(orderId: number | string): Promise<AxiosResponse<ILogisticVedHistoryResponse[]>> {
		return $api.get('/logistic-ved-history/byOrderId/' + orderId).catch((error) => error.response);
	}

	static async deleteHistoryById(id: string | number): Promise<AxiosResponse<ILogisticVedHistoryResponse | null>> {
		return $api.delete('/logistic-ved-history/byId/' + id).catch((error) => {
			return error.response;
		});
	}

	/*********************/
	/*********************/
	/******* Файлы *******/
	/*********************/
	/*********************/
	static async createFile(dto: ILogisticVedFileCreateDto): Promise<AxiosResponse<ILogisticVedFileResponse>> {
		const data = new FormData();
		data.append('file', dto.file);
		data.append('type', dto.type);
		if (dto.comment) data.append('comment', dto.comment);
		data.append('orderId', String(dto.orderId));
		data.append('authorId', String(dto.authorId));
		return $api.post('/logistic-ved-file', data, {
			headers: { 'content-type': 'multipart/form-data' },
		});
	}
}
