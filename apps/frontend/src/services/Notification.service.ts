import { ServiceResponse } from '@interfaces';
import { ISendMessageTelegramDto } from '@interfaces/notification/send-message.telegram.dto';
import { ISendMessageTelegramResponse } from '@interfaces/notification/send-message.telegram.response';
import $api from '../helpers/Api.http';

export default class NotificationService {
	/** @summary Отправка сообщения в Телеграм @returns [response, error] */
	static async sendMessageTelegram(
		dto: ISendMessageTelegramDto
	): Promise<ServiceResponse<ISendMessageTelegramResponse>> {
		let response, error;
		await $api
			.post('/notification/telegram/sendMessage', dto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	/** @summary Отправка сообщения о том что сотрудник опоздал @returns [void, error] */
	static async cronIsLate(userId: number | string): Promise<ServiceResponse<void>> {
		let response, error;
		await $api
			.get('/notification/cron/lateness/staffIsLate/' + userId)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
