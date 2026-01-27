import Constants from '../../constants/cron/logistic-ved';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common';
import { UserService } from '../../../user/user.service';
import { TelegramService } from '../telegram.service';
import { format, formatDistance, formatISO } from 'date-fns';
import { utcToZonedTime, format as formatTz } from 'date-fns-tz';
import { ru } from 'date-fns/locale';
import { isArray } from 'lodash';
import { ProductionCalendarService } from '../../../production-calendar/production-calendar.service';
import { VacationCalendarService } from '../../../vacation-calendar/services';

// await this.telegramService.sendMessage(66526752, message);
// await this.telegramService.sendMessage(133920953, message);

@Injectable()
export class CronLatenessService extends PrismaService {
	timeZone;

	constructor(
		private readonly telegramService: TelegramService,
		private readonly userService: UserService,
		private readonly productionCalendarService: ProductionCalendarService,
		private readonly vacationCalendarService: VacationCalendarService
	) {
		super();
		this.timeZone = 'Asia/Tashkent';
	}

	staffIsLate = async (userId: number | string): Promise<void> => {
		if (!userId) throw new HttpException(Constants.ERROR_USER_ID_IS_EMPTY, HttpStatus.BAD_REQUEST);

		const user = await this.userService.findById(Number(userId));
		const lateness = await this.userService.findLastLatenessByUserId(userId);
		const selfDate = utcToZonedTime(new Date(), this.timeZone);
		const maxAllowedTime = new Date(`${formatTz(selfDate, 'yyyy-MM-dd')} 09:00:00`);

		// let message = 'ТЕСТ\nНЕ ОБРАЩАЙТЕ ВНИМАНИЕ НА СООБЩЕНИЕ.\nТЕСТ\n\n';
		let message = '';
		message += `⏰ <b>Опоздание</b>\n\n`;
		message += `<b>${user.lastName} ${user.firstName}</b> ${
			user.sex === 'male' ? 'отметился' : 'отметилась'
		} на рабочем месте в ${formatTz(selfDate, 'k:mm')}.\n`;

		message += `Время опоздания ${formatDistance(selfDate, maxAllowedTime, {
			locale: ru,
		})} \n`;
		message += `Указанная причина опоздания: ${lateness?.comment || 'Не указана'}`;
		if (user.phoneVoip || user.phoneMobile) message += `\n\n`;
		if (user.phoneVoip) message += `Внутренний: ${user.phoneVoip}\n`;
		if (user.phoneMobile) message += `Мобильный: ${user.phoneMobile}`;

		const notificationTarget: number[] = [];
		const users = await this.userService.findByRole('latenessNotification');
		if (!!users.length)
			users.forEach((user) => {
				if (user.telegramId) notificationTarget.push(Number(user.telegramId));
			});
		if (!!user.parent && user.parent.telegramId) notificationTarget.push(Number(user.parent.telegramId));

		if (!!notificationTarget.length)
			for (const telegramId of notificationTarget) {
				await this.telegramService.sendMessage(telegramId, message);
			}
	};

	didComeToday = async (): Promise<void> => {
		const DATE_TODAY = new Date();
		const DATE_FORMAT = format(new Date(), 'yyyy-MM-dd');

		const holidays = await this.productionCalendarService.findBetweenDateRange({
			start: formatISO(DATE_TODAY),
			end: formatISO(DATE_TODAY),
		});
		if (holidays.length) return;

		const latenessAll = await this.userService.findLatenessAll({
			dateStart: DATE_FORMAT,
			dateEnd: DATE_FORMAT,
		});

		if (latenessAll.length) {
			// let message = 'ТЕСТ\nНЕ ОБРАЩАЙТЕ ВНИМАНИЕ НА СООБЩЕНИЕ.\nТЕСТ\n\n';
			let message = '';
			message += `⏰ <b>Не отметились сегодня</b>\n\n`;

			const didCome = latenessAll.filter((user) => format(user.lateness[0].createdAt, 'mmSSS') === '00000');
			if (didCome.length) {
				let index = 0;
				message += `Сегодня не отметились ${didCome.length} чел.:\n`;
				for (const user of didCome) {
					const vacations = await this.vacationCalendarService.findBetweenDateRange({
						start: formatISO(DATE_TODAY),
						end: formatISO(DATE_TODAY),
						userId: user.id,
					});
					index++;
					message += `${index}. ${user.lastName} ${user.firstName}${
						vacations.length ? ' <b>(в отпуске)</b>' : ''
					}\n`;
				}
				// didCome.forEach((user, index) => {});
			}
			message += `\n<a href='${process.env.DOMAIN_FRONTEND}/staff/late'>Страница с опоздавшими</a>`;

			const users = await this.userService.findByRole('latenessNotification');
			if (!!users.length)
				for (const user of users) {
					if (user.telegramId) await this.telegramService.sendMessage(Number(user.telegramId), message);
				}
		}
	};

	forgotToCheckIn = async (): Promise<void> => {
		const DATE_TODAY = new Date();

		const holidays = await this.productionCalendarService.findBetweenDateRange({
			start: formatISO(DATE_TODAY),
			end: formatISO(DATE_TODAY),
		});
		if (holidays.length) return;

		const users = await this.userService.findDidComeToday();
		if (!users) return;

		if (users.length)
			for (const user of users) {
				const { firstName, telegramId, id } = user;

				const vacations = await this.vacationCalendarService.findBetweenDateRange({
					start: formatISO(DATE_TODAY),
					end: formatISO(DATE_TODAY),
					userId: id,
				});
				if (vacations.length) return;

				let message = '';
				// message += 'ТЕСТ\nНЕ ОБРАЩАЙТЕ ВНИМАНИЕ НА СООБЩЕНИЕ.\nТЕСТ\n\n';

				message += `⏰ <b>${firstName}, кажется вы забыли сегодня отметиться!</b>`;

				message += `\n\nВремя уже 9:00 🕘, а вы до сих пор не отметились в системе.`;
				message += ` В компании ведется табель опоздавших, могут быть штрафные санкции. `;
				message += ` 🤔 Даем последний шанс, успеть до 9:04, тогда опоздание не будет засчитано.`;
				message += `\n\n⏳ Время пошло...`;
				message += `\n\n<a href='${process.env.DOMAIN_FRONTEND}'>Отметиться в системе</a>`;

				if (telegramId) await this.telegramService.sendMessage(Number(telegramId), message);
			}
	};

	teamAttendanceReport = async (date?: Date): Promise<void | any> => {
		const findLeads = await this.userService.findLeads({ child: true });

		if (findLeads.length)
			for (const user of findLeads) {
				const { firstName, telegramId } = user;
				const findChildLateness = await this.userService.findLatenessAll({
					dateStart: format(date || new Date(), 'yyyy-MM-dd'),
					dateEnd: format(date || new Date(), 'yyyy-MM-dd'),
					group: true,
					id: user.child.map((child) => child.id),
				});

				if (!findChildLateness) continue;

				const arrived = findChildLateness.filter(
					(child) => !isArray(child.lateness) && !!child.lateness.arrived.length
				);

				const lateness = findChildLateness.filter(
					(child) => !isArray(child.lateness) && !!child.lateness.lateness.length
				);

				const didCome = findChildLateness.filter(
					(child) => !isArray(child.lateness) && !!child.lateness.didCome.length
				);

				let message = '';
				// message += 'ТЕСТ\nНЕ ОБРАЩАЙТЕ ВНИМАНИЕ НА СООБЩЕНИЕ.\nТЕСТ\n\n';

				message += `⏰ <b>${firstName}, отчет о посещаемости Вашей команды:</b>\n`;

				if (arrived.length) {
					message += `\n🚀 <b>${
						arrived.length !== 1 ? 'Пришли' : arrived[0].sex === 'male' ? 'Пришел' : 'Пришла'
					} вовремя:</b>\n`;
					arrived.forEach((child) => {
						if (!isArray(child.lateness))
							message += `- ${child.lastName} ${child.firstName} (${child.lateness.arrived[0].time})\n`;
					});
				}

				if (lateness.length) {
					message += `\n😴  <b>${
						lateness.length !== 1 ? 'Опоздали' : lateness[0].sex === 'male' ? 'Опоздал' : 'Опоздала'
					}:</b>\n`;
					lateness.forEach((child) => {
						if (!isArray(child.lateness))
							message += `- ${child.lastName} ${child.firstName} (${
								child.lateness.lateness[0].time
							})\n  <i>Комментарий: ${child.lateness.lateness[0].comment.replace(/\s+/g, ' ')}</i>\n`;
					});
				}

				if (didCome.length) {
					message += `\n🥷 <b>Не ${
						didCome.length !== 1 ? 'пришли' : didCome[0].sex === 'male' ? 'пришел' : 'пришла'
					} сегодня:</b>\n`;
					didCome.forEach((child) => {
						if (!isArray(child.lateness)) message += `- ${child.lastName} ${child.firstName}\n`;
					});
				}

				if (telegramId) await this.telegramService.sendMessage(Number(telegramId), message);
			}
	};
}
