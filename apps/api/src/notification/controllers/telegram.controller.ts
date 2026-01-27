import { Body, Controller, Post } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageTelegramEntity } from '../entity/send-message-telegram.entity';
import { SendMessageTelegramDto } from '../dto/send-message-telegram.dto';
import { TelegramService } from '../services/telegram.service';

@Controller('notification/telegram')
export class TelegramController {
	constructor(private readonly telegramService: TelegramService) {}

	@Post('/sendMessage')
	@UsePipes(new ValidationPipe())
	async sendMessage(@Body() dto: SendMessageTelegramDto): Promise<SendMessageTelegramEntity> {
		const { chatId, message } = dto;
		return await this.telegramService.sendMessage(Number(chatId), message);
	}
}
