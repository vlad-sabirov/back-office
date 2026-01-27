import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { SendMessageTelegramEntity } from '../entity/send-message-telegram.entity';

@Injectable()
export class TelegramService {
	bot: Telegraf;

	constructor() {
		this.bot = new Telegraf(process.env.TELEGRAM_TOKEN);
	}

	public async sendMessage(chatId: number, message: string): Promise<SendMessageTelegramEntity> {
		const sendMessage = await this.bot.telegram
			.sendMessage(chatId, message, {
				parse_mode: 'HTML',
			})
			.catch(() => true);

		return sendMessage as SendMessageTelegramEntity;
	}
}
