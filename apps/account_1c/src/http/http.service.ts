import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService as AxiosHttpService } from '@nestjs/axios';
import { IHttpReject } from './http.types';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpService implements OnModuleInit {
	private logger: Logger = new Logger('HttpService');

	constructor(private readonly httpService: AxiosHttpService) {}

	onModuleInit() {
		this.logger.log('Initialized');
	}

	get = async <T>(
		url,
		config?: AxiosRequestConfig,
	): Promise<T | IHttpReject> => {
		const response = this.httpService.get<T>(url, config).toPromise();
		return await response
			.then((res) => res.data)
			.catch((err) => {
				return {
					status: err.response.status,
					statusText: 'error',
					message: err.response.statusText,
				} as IHttpReject;
			});
	};

	post = async <T>(
		url,
		dto?: Record<string, any>,
		config?: AxiosRequestConfig,
	): Promise<T | IHttpReject> => {
		const response = this.httpService.post<T>(url, dto, config).toPromise();
		return await response
			.then((res) => res.data)
			.catch((err) => {
				return {
					status: err.response.status,
					statusText: 'error',
					message: err.response.statusText,
				} as IHttpReject;
			});
	};

	put = async <T>(
		url,
		dto: Record<string, any>,
		config?: AxiosRequestConfig,
	): Promise<T | IHttpReject> => {
		const response = this.httpService.put<T>(url, dto, config).toPromise();
		return await response
			.then((res) => res.data)
			.catch((err) => {
				return {
					status: err.response.status,
					statusText: 'error',
					message: err.response.statusText,
				} as IHttpReject;
			});
	};

	patch = async <T>(
		url,
		dto: Record<string, any>,
		config?: AxiosRequestConfig,
	): Promise<T | IHttpReject> => {
		const response = this.httpService.patch<T>(url, dto, config).toPromise();
		return await response
			.then((res) => res.data)
			.catch((err) => {
				return {
					status: err.response.status,
					statusText: 'error',
					message: err.response.statusText,
				} as IHttpReject;
			});
	};
}
