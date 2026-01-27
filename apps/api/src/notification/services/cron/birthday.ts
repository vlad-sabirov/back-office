import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common';
import { UserEntity } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/user.service';
import { TelegramService } from '../telegram.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

@Injectable()
export class CronBirthdayService extends PrismaService {
	constructor(private readonly telegramService: TelegramService, private readonly userService: UserService) {
		super();
	}

	findBirthdayToday = async (): Promise<void> => {
		let message = '';
		const findBirthdayUsers: UserEntity[] = await this
			.$queryRaw`SELECT * FROM public.user WHERE date_part('day', birthday) = date_part('day', CURRENT_DATE) 
                                            AND date_part('month', birthday) = date_part('month', CURRENT_DATE)
                                            AND NOT "isFired"`;

		if (findBirthdayUsers.length > 0)
			for (const birthdayUser of findBirthdayUsers) {
				const user = await this.userService.findById(birthdayUser.id);

				message += `🎉 <b>День рождения</b> 🎉\n\n`;
				message += `🥳 <b>${user.lastName} ${user.firstName}</b> сегодня празднует свой день рождения! Не забудьте поздравить коллегу!\n\n`;
				message += `Территория: ${user.territory.name}\n`;
				message += user.phoneVoip ? `Внутренний номер: ${user.phoneVoip}\n` : null;
				message += user.phoneMobile ? `Мобильный номер: ${user.phoneMobile}` : null;

				const findUsers = await this.userService.findActive();
				if (findUsers.length) {
					for (const user of findUsers) {
						if (user.telegramId && user.id !== birthdayUser.id) {
							await this.telegramService.sendMessage(Number(user.telegramId), message);
						}
					}
				}
				// await this.telegramService.sendMessage(66526752, message);
				// await this.telegramService.sendMessage(133920953, message);
			}
	};

	findBirthdayThisMonth = async () => {
		let message = '';
		const findBirthdayUsers: UserEntity[] = await this
			.$queryRaw`SELECT * FROM public.user WHERE date_part('month', birthday) = date_part('month', CURRENT_DATE) AND NOT "isFired"`;

		if (findBirthdayUsers.length > 0) {
			message += `📅 <b>Дни рождения в этом месяце</b> 📅\n`;
			message += `В это месяце именинников: ${findBirthdayUsers.length} чел.\n`;

			const territories = [];
			for (const birthdayUser of findBirthdayUsers) {
				const user = await this.userService.findById(birthdayUser.id);
				if (!territories.includes(user.territory.name)) territories.push(user.territory.name);
			}
			const users = [];
			for (const birthdayUser of findBirthdayUsers) {
				const user = await this.userService.findById(birthdayUser.id);
				const date = format(new Date(user.birthday), 'd MMMM', { locale: ru });
				users.push({
					lastName: user.lastName,
					territory: user.territory.name,
					firstName: user.firstName,
					date: date,
				});
			}

			territories.forEach((territory) => {
				message += `\n<b>${territory}</b>\n`;
				users.forEach((user) => {
					if (territory === user.territory)
						message += `<i>${user.lastName} ${user.firstName} (${user.date})</i>\n`;
				});
			});
		}

		const findUsers = await this.userService.findActive();
		if (findUsers.length) {
			for (const user of findUsers) {
				if (user.telegramId) {
					await this.telegramService.sendMessage(Number(user.telegramId), message);
				}
			}
		}
		// await this.telegramService.sendMessage(66526752, message);
		// await this.telegramService.sendMessage(133920953, message);
	};
}
