import { Injectable } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';

@Injectable()
export class NotificationService {
	constructor(private readonly telegramService: TelegramService) {}
}
