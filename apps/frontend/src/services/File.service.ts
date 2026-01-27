import { IFileUploadResponse } from '@helpers/interfaces';
import { ServiceResponse } from '@interfaces';
import $api from '../helpers/Api.http';

export default class FileService {
	/** @summary Загрузка фотографий из blob @returns [response, error] */
	static async uploadImageHelper(blobUrl: string, folder: string): Promise<ServiceResponse<IFileUploadResponse>> {
		let response, error;

		const file = await fetch(blobUrl).then((res) => res.blob());
		const data = new FormData();
		data.append('file', file);
		data.append('folder', folder);

		await $api
			.post('/file/image/', data, {
				headers: {
					'content-type': 'multipart/form-data',
				},
			})
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Удаление файла @returns [void, error] */
	static async deleteFile(filePath: string): Promise<ServiceResponse<void>> {
		let response, error;
		await $api
			.post('/file/deleteFile/', { filePath: filePath })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
