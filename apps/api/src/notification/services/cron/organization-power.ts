import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { format, subDays, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PrismaService } from '../../../common';
import { TelegramService } from '../telegram.service';
import { UserService } from '../../../user/user.service';

interface PowerConfig {
	medium: number; // дней до "теплых" (30)
	low: number;    // дней до "холодных" (60)
	empty: number;  // дней до "забытых" (90)
}

@Injectable()
export class CronOrganizationPowerService extends PrismaService {
	private readonly logger = new Logger(CronOrganizationPowerService.name);

	private readonly defaultPowerConfig: PowerConfig = {
		medium: 30,
		low: 60,
		empty: 90,
	};

	constructor(
		private readonly telegramService: TelegramService,
		private readonly userService: UserService
	) {
		super();
	}

	/**
	 * Предупреждение за 3 дня до смены статуса
	 */
	sendPreWarning3Days = async (config?: PowerConfig): Promise<{ sent: number }> => {
		const powerConfig = config || this.defaultPowerConfig;
		const now = new Date();
		let sentCount = 0;

		const transitions: { daysAgo: number; from: string; to: string }[] = [
			{ daysAgo: powerConfig.medium - 3, from: 'full', to: 'medium' },
			{ daysAgo: powerConfig.low - 3, from: 'medium', to: 'low' },
			{ daysAgo: powerConfig.empty - 3, from: 'low', to: 'empty' },
		];

		for (const transition of transitions) {
			const windowStart = subDays(now, transition.daysAgo + 1);
			const windowEnd = subDays(now, transition.daysAgo);

			const orgs = await this.crmOrganization.findMany({
				where: {
					last1CUpdate: {
						gt: windowStart,
						lte: windowEnd,
					},
				},
				include: { user: true },
			});

			for (const org of orgs) {
				const alreadyWarned = await this.crmOrganizationPowerLog.findFirst({
					where: {
						organizationId: org.id,
						newStatus: transition.to,
						preWarned3Days: true,
					},
				});

				if (!alreadyWarned) {
					const manager = org.user as any;
					if (manager?.telegramId) {
						const message = this.buildPreWarningMessage(org, transition.from, transition.to, 3);
						await this.telegramService.sendMessage(Number(manager.telegramId), message);
						sentCount++;
					}
					await this.crmOrganizationPowerLog.create({
						data: {
							organizationId: org.id,
							previousStatus: transition.from,
							newStatus: transition.to,
							preWarned3Days: true,
						},
					});
				}
			}
		}

		this.logger.log(`Pre-warning 3 days sent: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Предупреждение за 1 день до смены статуса
	 */
	sendPreWarning1Day = async (config?: PowerConfig): Promise<{ sent: number }> => {
		const powerConfig = config || this.defaultPowerConfig;
		const now = new Date();
		let sentCount = 0;

		const transitions: { daysAgo: number; from: string; to: string }[] = [
			{ daysAgo: powerConfig.medium - 1, from: 'full', to: 'medium' },
			{ daysAgo: powerConfig.low - 1, from: 'medium', to: 'low' },
			{ daysAgo: powerConfig.empty - 1, from: 'low', to: 'empty' },
		];

		for (const transition of transitions) {
			const windowStart = subDays(now, transition.daysAgo + 1);
			const windowEnd = subDays(now, transition.daysAgo);

			const orgs = await this.crmOrganization.findMany({
				where: {
					last1CUpdate: {
						gt: windowStart,
						lte: windowEnd,
					},
				},
				include: { user: true },
			});

			for (const org of orgs) {
				const alreadyWarned = await this.crmOrganizationPowerLog.findFirst({
					where: {
						organizationId: org.id,
						newStatus: transition.to,
						preWarned1Day: true,
					},
				});

				if (!alreadyWarned) {
					const manager = org.user as any;
					if (manager?.telegramId) {
						const message = this.buildPreWarningMessage(org, transition.from, transition.to, 1);
						await this.telegramService.sendMessage(Number(manager.telegramId), message);
						sentCount++;
					}
					// Обновить существующую запись или создать новую
					const existingLog = await this.crmOrganizationPowerLog.findFirst({
						where: {
							organizationId: org.id,
							newStatus: transition.to,
							preWarned3Days: true,
						},
					});
					if (existingLog) {
						await this.crmOrganizationPowerLog.update({
							where: { id: existingLog.id },
							data: { preWarned1Day: true },
						});
					} else {
						await this.crmOrganizationPowerLog.create({
							data: {
								organizationId: org.id,
								previousStatus: transition.from,
								newStatus: transition.to,
								preWarned1Day: true,
							},
						});
					}
				}
			}
		}

		this.logger.log(`Pre-warning 1 day sent: ${sentCount}`);
		return { sent: sentCount };
	};

	/**
	 * Проверка изменений Power статусов организаций + предупреждения
	 * Запускается ежедневно в 9:00
	 */
	@Cron('0 9 * * *')
	async checkPowerStatusChanges(config?: PowerConfig): Promise<{ notifications: number; preWarning3Days: number; preWarning1Day: number }> {
		this.logger.log('Running scheduled power status check...');
		const pw3 = await this.sendPreWarning3Days(config);
		const pw1 = await this.sendPreWarning1Day(config);

		const powerConfig = config || this.defaultPowerConfig;
		const now = new Date();

		// Даты границ статусов
		const mediumThreshold = subDays(now, powerConfig.medium);
		const lowThreshold = subDays(now, powerConfig.low);
		const emptyThreshold = subDays(now, powerConfig.empty);

		let notificationCount = 0;

		// 1. Организации, которые перешли из Full в Medium (теплые → холодные)
		const newMediumOrgs = await this.crmOrganization.findMany({
			where: {
				last1CUpdate: {
					lte: mediumThreshold,
					gt: lowThreshold,
				},
				// Исключаем уже уведомленные (проверяем по логу)
			},
			include: { user: true },
		});

		for (const org of newMediumOrgs) {
			const alreadyNotified = await this.crmOrganizationPowerLog.findFirst({
				where: {
					organizationId: org.id,
					newStatus: 'medium',
				},
			});

			if (!alreadyNotified) {
				await this.notifyStatusChange(org, 'full', 'medium');
				notificationCount++;
			}
		}

		// 2. Организации, которые перешли из Medium в Low (холодные)
		const newLowOrgs = await this.crmOrganization.findMany({
			where: {
				last1CUpdate: {
					lte: lowThreshold,
					gt: emptyThreshold,
				},
			},
			include: { user: true },
		});

		for (const org of newLowOrgs) {
			const alreadyNotified = await this.crmOrganizationPowerLog.findFirst({
				where: {
					organizationId: org.id,
					newStatus: 'low',
				},
			});

			if (!alreadyNotified) {
				await this.notifyStatusChange(org, 'medium', 'low');
				notificationCount++;
			}
		}

		// 3. Организации, которые перешли в Empty (забытые)
		const newEmptyOrgs = await this.crmOrganization.findMany({
			where: {
				last1CUpdate: {
					lte: emptyThreshold,
				},
			},
			include: { user: true },
		});

		for (const org of newEmptyOrgs) {
			const alreadyNotified = await this.crmOrganizationPowerLog.findFirst({
				where: {
					organizationId: org.id,
					newStatus: 'empty',
				},
			});

			if (!alreadyNotified) {
				await this.notifyStatusChange(org, 'low', 'empty');
				notificationCount++;
			}
		}

		const result = { notifications: notificationCount, preWarning3Days: pw3.sent, preWarning1Day: pw1.sent };
		this.logger.log(`Power status check complete: ${JSON.stringify(result)}`);
		return result;
	}

	/**
	 * Получить статистику по Power статусам
	 */
	getPowerStatistics = async (config?: PowerConfig): Promise<{
		full: number;
		medium: number;
		low: number;
		empty: number;
		total: number;
	}> => {
		const powerConfig = config || this.defaultPowerConfig;
		const now = new Date();

		const mediumThreshold = subDays(now, powerConfig.medium);
		const lowThreshold = subDays(now, powerConfig.low);
		const emptyThreshold = subDays(now, powerConfig.empty);

		const [full, medium, low, empty, total] = await Promise.all([
			this.crmOrganization.count({
				where: { last1CUpdate: { gt: mediumThreshold } },
			}),
			this.crmOrganization.count({
				where: {
					last1CUpdate: { lte: mediumThreshold, gt: lowThreshold },
				},
			}),
			this.crmOrganization.count({
				where: {
					last1CUpdate: { lte: lowThreshold, gt: emptyThreshold },
				},
			}),
			this.crmOrganization.count({
				where: { last1CUpdate: { lte: emptyThreshold } },
			}),
			this.crmOrganization.count(),
		]);

		return { full, medium, low, empty, total };
	};

	// ==================== Private ====================

	private notifyStatusChange = async (
		org: any,
		previousStatus: string,
		newStatus: string
	): Promise<void> => {
		const manager = org.user as any;

		// Создать запись в логе
		await this.crmOrganizationPowerLog.create({
			data: {
				organizationId: org.id,
				previousStatus,
				newStatus,
			},
		});

		const message = this.buildPowerChangeMessage(org, previousStatus, newStatus, manager);

		// Уведомить менеджера
		if (manager?.telegramId) {
			await this.telegramService.sendMessage(Number(manager.telegramId), message);
		}

		// Если статус empty - уведомить также руководителя
		if (newStatus === 'empty' && manager?.id) {
			const fullManager = await this.userService.findById(manager.id);
			if (fullManager?.parent?.telegramId) {
				const leaderMessage = this.buildLeaderPowerMessage(org, manager);
				await this.telegramService.sendMessage(Number(fullManager.parent.telegramId), leaderMessage);
			}
		}
	};

	private buildPowerChangeMessage = (org: any, previousStatus: string, newStatus: string, manager: any): string => {
		const statusLabels: Record<string, string> = {
			full: '🟢 Активные',
			medium: '🟡 Теплые',
			low: '🟠 Холодные',
			empty: '🔴 Забытые',
		};

		let message = `📊 <b>Изменение статуса организации</b>\n\n`;
		message += `<b>${org.nameRu || org.nameEn || 'Без названия'}</b>\n`;
		message += `${statusLabels[previousStatus]} → ${statusLabels[newStatus]}\n\n`;

		if (org.last1CUpdate) {
			message += `<b>Последняя покупка:</b> ${format(new Date(org.last1CUpdate), 'd MMMM yyyy', { locale: ru })}\n`;
		}

		if (newStatus === 'low') {
			message += `\n⚠️ <i>Рекомендуем связаться с клиентом</i>`;
		} else if (newStatus === 'empty') {
			message += `\n🚨 <i>Срочно требуется контакт!</i>`;
		}

		return message;
	};

	private buildPreWarningMessage = (org: any, fromStatus: string, toStatus: string, daysLeft: number): string => {
		const statusLabels: Record<string, string> = {
			full: '🟢 Активные',
			medium: '🟡 Теплые',
			low: '🟠 Холодные',
			empty: '🔴 Забытые',
		};

		const urgency = daysLeft === 1 ? '🚨' : '⚠️';
		const daysText = daysLeft === 1 ? 'Завтра' : `Через ${daysLeft} дня`;

		let message = `${urgency} <b>${daysText} сменится статус организации</b>\n\n`;
		message += `<b>${org.nameRu || org.nameEn || 'Без названия'}</b>\n`;
		message += `${statusLabels[fromStatus]} → ${statusLabels[toStatus]}\n\n`;

		if (org.last1CUpdate) {
			message += `<b>Последняя покупка:</b> ${format(new Date(org.last1CUpdate), 'd MMMM yyyy', { locale: ru })}\n`;
		}

		message += `\n📞 <i>Позвоните клиенту, чтобы предотвратить смену статуса!</i>`;

		return message;
	};

	private buildLeaderPowerMessage = (org: any, manager: any): string => {
		let message = `🚨 <b>Организация перешла в "Забытые"</b>\n\n`;
		message += `<b>Организация:</b> ${org.nameRu || org.nameEn || 'Без названия'}\n`;
		message += `<b>Менеджер:</b> ${manager?.lastName || ''} ${manager?.firstName || ''}\n`;

		if (org.last1CUpdate) {
			message += `<b>Последняя покупка:</b> ${format(new Date(org.last1CUpdate), 'd MMMM yyyy', { locale: ru })}\n`;
		}

		message += `\n⚠️ <i>Срочно требуется контакт с клиентом!</i>`;

		return message;
	};
}
