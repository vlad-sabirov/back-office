import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class SendMessageTelegramDto {
	@IsNumber()
	@Min(3)
	chatId: number | string;

	@IsString()
	@MinLength(10)
	message: string;
}
