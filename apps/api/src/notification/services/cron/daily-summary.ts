import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Markup } from 'telegraf';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../../common';
import { TelegramService } from '../telegram.service';

const TZ = 'Asia/Tashkent';

@Injectable()
export class CronDailySummaryService extends PrismaService {
	private readonly logger = new Logger('CronDailySummaryService');

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	/**
	 * Каждое утро в 9:15 (Пн-Сб) — отправка сводки
	 */
	@Cron('15 9 * * 1-6', { timeZone: TZ })
	async sendMorningSummary(): Promise<void> {
		this.logger.log('Starting daily summary...');

		const managers = await this.user.findMany({
			where: {
				isFired: false,
				telegramId: { not: null },
				roles: { some: { alias: 'crm' } },
			},
		});

		let sent = 0;
		for (const manager of managers) {
			if (!manager.telegramId || manager.telegramId === '0') continue;
			try {
				await this.sendSummaryToUser(manager);
				sent++;
			} catch (err) {
				this.logger.error(`Error sending summary to ${manager.lastName}: ${err.message}`);
			}
		}

		this.logger.log(`Daily summary sent to ${sent} managers`);
	}

	/**
	 * Каждый вечер в 18:00 (Пн-Сб) — удаление утреннего сообщения
	 */
	@Cron('0 18 * * 1-6', { timeZone: TZ })
	async deleteEveningSummary(): Promise<void> {
		this.logger.log('Deleting morning messages...');
		const today = this.getToday();

		const messages = await this.telegramDailyMessage.findMany({
			where: { date: today },
		});

		let deleted = 0;
		for (const msg of messages) {
			try {
				await this.telegramService.deleteMessage(Number(msg.chatId), msg.messageId);
				deleted++;
			} catch (err) {
				this.logger.error(`Error deleting message: ${err.message}`);
			}
		}

		await this.telegramDailyMessage.deleteMany({ where: { date: today } });
		this.logger.log(`Deleted ${deleted} messages`);
	}

	/**
	 * Обновить утреннее сообщение пользователя (вызывается при создании задачи)
	 */
	public async refreshSummaryForUser(userId: number): Promise<void> {
		const today = this.getToday();
		const saved = await this.telegramDailyMessage.findUnique({
			where: { userId_date: { userId, date: today } },
		});
		if (!saved) return;

		const manager = await this.user.findUnique({
			where: { id: userId },
		});
		if (!manager?.telegramId || manager.telegramId === '0') return;

		try {
			const { text, keyboard } = await this.buildMessage(manager);
			await this.telegramService.editMessage(
				Number(saved.chatId),
				saved.messageId,
				text,
				Markup.inlineKeyboard(keyboard),
			);
		} catch (err) {
			this.logger.error(`Error refreshing summary for ${manager.lastName}: ${err.message}`);
		}
	}

	// ==================== Private ====================

	private async sendSummaryToUser(manager: any): Promise<void> {
		const chatId = Number(manager.telegramId);
		const today = this.getToday();

		// Удалить предыдущее сообщение если есть
		const existing = await this.telegramDailyMessage.findUnique({
			where: { userId_date: { userId: manager.id, date: today } },
		});
		if (existing) {
			try {
				await this.telegramService.deleteMessage(Number(existing.chatId), existing.messageId);
			} catch {}
			await this.telegramDailyMessage.delete({ where: { id: existing.id } });
		}

		const { text, keyboard } = await this.buildMessage(manager);

		const result = await this.telegramService.sendMessageWithKeyboard(
			chatId,
			text,
			Markup.inlineKeyboard(keyboard),
		);

		// Сохраняем message_id в БД
		if (result && typeof result === 'object' && 'message_id' in result) {
			await this.telegramDailyMessage.create({
				data: {
					userId: manager.id,
					chatId: BigInt(chatId),
					messageId: result.message_id,
					date: today,
				},
			});
		}
	}

	private async buildMessage(manager: any): Promise<{ text: string; keyboard: any[][] }> {
		const now = utcToZonedTime(new Date(), TZ);

		// 1. Просроченные задачи
		const overdueTasks = await this.crmTask.findMany({
			where: {
				assigneeId: manager.id,
				status: { in: ['pending', 'in_progress'] },
				deadline: { lt: new Date() },
			},
			include: { organization: true },
			orderBy: { deadline: 'asc' },
			take: 5,
		});

		// 2. Задачи на сегодня
		const todayStart = new Date(now);
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date(now);
		todayEnd.setHours(23, 59, 59, 999);

		const todayTasks = await this.crmTask.findMany({
			where: {
				assigneeId: manager.id,
				status: { in: ['pending', 'in_progress'] },
				deadline: { gte: todayStart, lte: todayEnd },
			},
			include: { organization: true },
			orderBy: { deadline: 'asc' },
			take: 5,
		});

		// 3. Остывающие организации (через 0-3 дня станут тёплыми→холодными)
		const coolingOrgs = await this.crmOrganization.findMany({
			where: {
				userId: manager.id,
				isArchive: false,
				last1CUpdate: {
					lte: new Date(Date.now() - 27 * 86400000),
					gte: new Date(Date.now() - 30 * 86400000),
				},
			},
			include: { phones: true },
			orderBy: { last1CUpdate: 'asc' },
		});

		// 4. Статистика базы
		const baseWhere = { userId: manager.id, isArchive: false };
		const [hotCount, warmCount, coldCount, forgottenCount] = await Promise.all([
			this.crmOrganization.count({ where: { ...baseWhere, last1CUpdate: { gte: new Date(Date.now() - 30 * 86400000) } } }),
			this.crmOrganization.count({ where: { ...baseWhere, last1CUpdate: { gte: new Date(Date.now() - 60 * 86400000), lt: new Date(Date.now() - 30 * 86400000) } } }),
			this.crmOrganization.count({ where: { ...baseWhere, last1CUpdate: { gte: new Date(Date.now() - 90 * 86400000), lt: new Date(Date.now() - 60 * 86400000) } } }),
			this.crmOrganization.count({ where: { ...baseWhere, OR: [{ last1CUpdate: { lt: new Date(Date.now() - 90 * 86400000) } }, { last1CUpdate: null }] } }),
		]);

		// Собираю сообщение
		let text = `📊 <b>Доброе утро, ${manager.firstName}!</b>\n\nВот твоя сводка на сегодня:\n\n`;

		if (overdueTasks.length > 0) {
			text += `🔴 <b>Просроченные задачи (${overdueTasks.length})</b>\n`;
			for (const task of overdueTasks) {
				const days = Math.ceil((Date.now() - new Date(task.deadline).getTime()) / 86400000);
				text += `• ${task.title} — ${days} дн.`;
				if (task.priority === 'urgent') text += ' ‼️';
				text += '\n';
			}
			text += '\n';
		}

		if (todayTasks.length > 0) {
			text += `⏰ <b>Задачи на сегодня (${todayTasks.length})</b>\n`;
			for (const task of todayTasks) {
				const time = format(utcToZonedTime(new Date(task.deadline), TZ), 'HH:mm');
				text += `• ${task.title} — до ${time}\n`;
			}
			text += '\n';
		}

		if (overdueTasks.length === 0 && todayTasks.length === 0) {
			text += `📝 <b>Задач нет — не забудьте запланировать день и записать задачи</b>\n\n`;
		}

		// 2.5. Порученные задачи (автор = я, исполнитель = другой)
		const authoredOverdue = await this.crmTask.findMany({
			where: {
				authorId: manager.id,
				assigneeId: { not: manager.id },
				status: { in: ['pending', 'in_progress'] },
				deadline: { lt: new Date() },
			},
			include: { assignee: true },
			orderBy: { deadline: 'asc' },
			take: 5,
		});

		const authoredToday = await this.crmTask.findMany({
			where: {
				authorId: manager.id,
				assigneeId: { not: manager.id },
				status: { in: ['pending', 'in_progress'] },
				deadline: { gte: todayStart, lte: todayEnd },
			},
			include: { assignee: true },
			orderBy: { deadline: 'asc' },
			take: 5,
		});

		if (authoredOverdue.length > 0 || authoredToday.length > 0) {
			text += '━━━━━━━━━━━━━━━━━━\n\n';
			text += `📤 <b>Порученные задачи</b>\n\n`;

			if (authoredOverdue.length > 0) {
				text += `🔴 <b>Просрочены (${authoredOverdue.length})</b>\n`;
				for (const task of authoredOverdue) {
					const days = Math.ceil((Date.now() - new Date(task.deadline).getTime()) / 86400000);
					const assignee = task.assignee as any;
					const name = assignee ? `${assignee.firstName}` : '';
					text += `• ${task.title} → ${name} — ${days} дн.`;
					if (task.priority === 'urgent') text += ' ‼️';
					text += '\n';
				}
				text += '\n';
			}

			if (authoredToday.length > 0) {
				text += `⏰ <b>На сегодня (${authoredToday.length})</b>\n`;
				for (const task of authoredToday) {
					const time = format(utcToZonedTime(new Date(task.deadline), TZ), 'HH:mm');
					const assignee = task.assignee as any;
					const name = assignee ? `${assignee.firstName}` : '';
					text += `• ${task.title} → ${name} — до ${time}\n`;
				}
				text += '\n';
			}
		}

		text += '━━━━━━━━━━━━━━━━━━\n\n';

		const keyboard: any[][] = [];

		if (coolingOrgs.length > 0) {
			text += `🟠 <b>Скоро остынут (1 из ${coolingOrgs.length})</b>\n\n`;
			const org = coolingOrgs[0];
			text += `🏢 <b>${org.nameRu || org.nameEn || 'Без названия'}</b>\n`;

			const contact = await this.getFirstContact(org.id);
			if (contact) text += `👤 ${contact}\n`;

			if (org.phones?.length > 0) text += `📞 ${this.formatPhone(org.phones[0].value)}\n`;

			const daysLeft = Math.max(0, 30 - Math.ceil((Date.now() - new Date(org.last1CUpdate).getTime()) / 86400000));
			text += `⏳ ${daysLeft > 0 ? `Через ${daysLeft} дн.` : 'Сегодня'} станет «холодным»\n`;

			keyboard.push([
				{ text: '📋 Открыть карточку', url: `http://back-office.uz/crm/organization?id=${org.id}` },
				{ text: '✅ Обработано', callback_data: `daily:done:${org.id}` },
			]);
			if (coolingOrgs.length > 1) {
				keyboard.push([
					{ text: '◀️ Назад', callback_data: `daily:prev:${manager.id}:cooling:0` },
					{ text: `1 / ${coolingOrgs.length}`, callback_data: 'daily:noop' },
					{ text: 'Далее ▶️', callback_data: `daily:next:${manager.id}:cooling:2` },
				]);
			}
		} else {
			text += `🟢 <b>Нет остывающих организаций — база в порядке!</b>\n`;
		}

		text += '\n━━━━━━━━━━━━━━━━━━\n\n';
		text += `🟢 Горячие: ${hotCount} | 🟡 Тёплые: ${warmCount} | 🟠 Холодные: ${coldCount} | 🔴 Забытые: ${forgottenCount}`;

		keyboard.push([{ text: '🌐 Открыть CRM', url: 'http://back-office.uz' }]);

		return { text, keyboard };
	}

	private async getFirstContact(orgId: number): Promise<string | null> {
		const link = await this.$queryRaw`
			SELECT c.name FROM crm_contact c
			JOIN "_CrmContactToCrmOrganization" co ON co."A" = c.id
			WHERE co."B" = ${orgId}
			LIMIT 1
		` as any[];
		return link?.[0]?.name || null;
	}

	private formatPhone(phone: string): string {
		if (!phone) return '';
		const clean = phone.replace(/\D/g, '');
		if (clean.length === 12) return `+${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10)}`;
		if (clean.length === 9) return `+998 ${clean.slice(0, 2)} ${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7)}`;
		return phone;
	}

	private getToday(): string {
		return format(utcToZonedTime(new Date(), TZ), 'yyyy-MM-dd');
	}
}
