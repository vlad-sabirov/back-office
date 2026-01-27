import { httpCsv } from '@helpers';
import { ServiceResponse } from '@interfaces';

export default class CsvService {
	static async toJson<T>(
		file: File
	): Promise<ServiceResponse<T[]>> {
		let response, error;
		const formData = new FormData();
		formData.append('file', file);
		await httpCsv
			.post('/toJson', formData)
			.then((res) => (response = res.data as T[]))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
