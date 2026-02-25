import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../common';
import { SendMessageTelegramEntity } from '../entity/send-message-telegram.entity';

@Injectable()
export class TelegramService extends PrismaService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(TelegramService.name);
	private readonly timeZone = 'Asia/Tashkent';
	bot: Telegraf;

	constructor() {
		super();
		this.bot = new Telegraf(process.env.TELEGRAM_TOKEN);
		this.registerHandlers();
	}

	async onModuleInit() {
		this.bot.launch().catch((err) => this.logger.error('Bot launch error:', err));
		this.logger.log('Telegram bot started (polling)');
	}

	async onModuleDestroy() {
		this.bot.stop('SIGTERM');
	}

	// ==================== Handlers ====================

	private readonly menuKeyboard = Markup.keyboard([
		['📋 Мои задачи', '📅 Мои события'],
	]).resize();

	private registerHandlers() {
		this.bot.start((ctx) => this.handleStart(ctx));
		this.bot.hears('📋 Мои задачи', (ctx) => this.handleTasksMenu(ctx));
		this.bot.hears('📅 Мои события', (ctx) => this.handleEventsMenu(ctx));
		this.bot.on('callback_query', (ctx) => this.handleCallback(ctx));
	}

	private async handleStart(ctx: any) {
		await ctx.reply(
			`👋 Привет! Я бот <b>Back-Office</b>.\n\nВыберите нужный раздел:`,
			{ parse_mode: 'HTML', ...this.menuKeyboard }
		);
	}

	private async handleTasksMenu(ctx: any) {
		const user = await this.findUserByTelegramId(ctx.from.id);
		if (!user) {
			await ctx.reply('❌ Ваш Telegram не привязан к аккаунту в системе.');
			return;
		}

		const tasks = await this.crmTask.findMany({
			where: {
				assigneeId: user.id,
				status: { notIn: ['completed', 'cancelled'] },
			},
			include: { organization: true },
			orderBy: { createdAt: 'desc' },
			take: 5,
		});

		if (tasks.length === 0) {
			await ctx.reply('✅ У вас нет активных задач.', this.menuKeyboard);
			return;
		}

		await ctx.reply(`📋 <b>Ваши активные задачи (${tasks.length}):</b>`, { parse_mode: 'HTML', ...this.menuKeyboard });

		for (const task of tasks) {
			const org = task.organization as any;
			const statusLabels: Record<string, string> = {
				pending: '⏳ Ожидание',
				in_progress: '▶️ В работе',
			};

			let text = `📋 <b>${task.title}</b>\n`;
			text += `Статус: ${statusLabels[task.status] || task.status}\n`;

			if (task.deadline) {
				const zoned = utcToZonedTime(new Date(task.deadline), this.timeZone);
				text += `Дедлайн: ${format(zoned, 'd MMM yyyy, HH:mm', { locale: ru })}\n`;
			}
			if (org) text += `🏢 ${org.nameRu || org.nameEn}\n`;

			const row1: any[] = [];
			if (task.status === 'pending') {
				row1.push(Markup.button.callback('▶️ В работе', `ts:${task.id}:wip`));
			}
			row1.push(Markup.button.callback('✅ Выполнено', `ts:${task.id}:done`));
			const row2 = [Markup.button.callback('🔍 Описание', `td:${task.id}:info`)];

			await ctx.reply(text, {
				parse_mode: 'HTML',
				...Markup.inlineKeyboard([row1, row2]),
			});
		}
	}

	private async handleEventsMenu(ctx: any) {
		const user = await this.findUserByTelegramId(ctx.from.id);
		if (!user) {
			await ctx.reply('❌ Ваш Telegram не привязан к аккаунту в системе.');
			return;
		}

		const now = new Date();
		const in7Days = new Date(now);
		in7Days.setDate(in7Days.getDate() + 7);

		// Мои события как ответственный
		const myEvents = await this.calendarEvent.findMany({
			where: {
				assigneeId: user.id,
				dateStart: { gte: now, lte: in7Days },
				status: { notIn: ['cancelled', 'completed'] },
				type: { in: ['meeting', 'call'] },
			},
			include: { organization: true },
			orderBy: { dateStart: 'asc' },
			take: 5,
		});

		// Приглашения как участник (pending)
		const myInvitations = await this.calendarEventParticipant.findMany({
			where: {
				userId: user.id,
				status: 'pending',
				event: {
					dateStart: { gte: now },
					status: { notIn: ['cancelled', 'completed'] },
				},
			},
			include: {
				event: { include: { organization: true } },
			},
			take: 5,
		});

		if (myEvents.length === 0 && myInvitations.length === 0) {
			await ctx.reply('📅 Нет предстоящих событий на ближайшую неделю.', this.menuKeyboard);
			return;
		}

		const typeLabels: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
		};

		// Приглашения
		if (myInvitations.length > 0) {
			await ctx.reply(`📨 <b>Ожидают вашего ответа (${myInvitations.length}):</b>`, { parse_mode: 'HTML' });
			for (const inv of myInvitations) {
				const ev = inv.event as any;
				const org = ev.organization as any;
				const zoned = utcToZonedTime(new Date(ev.dateStart), this.timeZone);
				let text = `${typeLabels[ev.type] || ev.type}: <b>${ev.title}</b>\n`;
				text += `🕐 ${format(zoned, 'd MMM, HH:mm', { locale: ru })}\n`;
				if (org) text += `🏢 ${org.nameRu || org.nameEn}\n`;

				await ctx.reply(text, {
					parse_mode: 'HTML',
					...Markup.inlineKeyboard([[
						Markup.button.callback('✅ Принять', `me:${ev.id}:accept`),
						Markup.button.callback('❌ Отклонить', `me:${ev.id}:decline`),
					], [
						Markup.button.callback('🔍 Описание', `ev:${ev.id}:info`),
					]]),
				});
			}
		}

		// Мои события
		if (myEvents.length > 0) {
			await ctx.reply(`📅 <b>Предстоящие события (${myEvents.length}):</b>`, { parse_mode: 'HTML' });
			for (const event of myEvents) {
				const org = event.organization as any;
				const zoned = utcToZonedTime(new Date(event.dateStart), this.timeZone);
				let text = `${typeLabels[event.type] || event.type}: <b>${event.title}</b>\n`;
				text += `🕐 ${format(zoned, 'd MMM, HH:mm', { locale: ru })}\n`;
				if (org) text += `🏢 ${org.nameRu || org.nameEn}\n`;

				await ctx.reply(text, {
					parse_mode: 'HTML',
					...Markup.inlineKeyboard([[
						Markup.button.callback('✅ Готово', `ev:${event.id}:done`),
						Markup.button.callback('❌ Отменено', `ev:${event.id}:cancel`),
					], [
						Markup.button.callback('🔍 Описание', `ev:${event.id}:info`),
					]]),
				});
			}
		}
	}

	private async handleCallback(ctx: any) {
		const data: string = (ctx.callbackQuery as any).data;
		if (!data) return;

		const parts = data.split(':');
		const prefix = parts[0];
		const entityId = Number(parts[1]);
		const action = parts[2];

		this.logger.log(`Callback: prefix=${prefix} entityId=${entityId} action=${action} telegramId=${ctx.from?.id}`);

		const user = await this.findUserByTelegramId(ctx.from.id);
		if (!user) {
			this.logger.warn(`User not found for telegramId=${ctx.from?.id}`);
			await ctx.answerCbQuery('❌ Аккаунт не привязан к системе.');
			return;
		}

		try {
			if (prefix === 'ts') {
				await this.handleTaskStatusChange(ctx, user, entityId, action);
			} else if (prefix === 'td') {
				await this.handleShowTaskDescription(ctx, user, entityId);
			} else if (prefix === 'me') {
				if (action === 'info') {
					await this.handleShowEventDescription(ctx, user, entityId);
				} else {
					await this.handleMeetingResponse(ctx, user, entityId, action);
				}
			} else if (prefix === 'ev') {
				if (action === 'info') {
					await this.handleShowEventDescription(ctx, user, entityId);
				} else {
					await this.handleEventStatusChange(ctx, user, entityId, action);
				}
			} else {
				await ctx.answerCbQuery();
			}
		} catch (err) {
			this.logger.error(`Callback handler error [${data}]:`, err);
			await ctx.answerCbQuery('⚠️ Произошла ошибка. Попробуйте позже.');
		}
	}

	private async handleTaskStatusChange(ctx: any, user: any, taskId: number, action: string) {
		const statusMap: Record<string, string> = {
			wip: 'in_progress',
			done: 'completed',
			cancel: 'cancelled',
		};
		const newStatus = statusMap[action];
		if (!newStatus) return;

		const task = await this.crmTask.findUnique({ where: { id: taskId } });
		if (!task) {
			await ctx.answerCbQuery('❌ Задача не найдена.');
			return;
		}
		if (task.assigneeId !== user.id && task.authorId !== user.id) {
			await ctx.answerCbQuery('❌ Нет доступа к этой задаче.');
			return;
		}

		await this.crmTask.update({ where: { id: taskId }, data: { status: newStatus } });

		const labels: Record<string, string> = {
			in_progress: '▶️ В работе',
			completed: '✅ Выполнено',
			cancelled: '❌ Отменено',
		};

		await ctx.answerCbQuery(`Статус: ${labels[newStatus]}`);
		await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		await ctx.reply(
			`✅ Задача обновлена!\n<b>${task.title}</b>\nНовый статус: <b>${labels[newStatus]}</b>`,
			{ parse_mode: 'HTML' }
		);
	}

	private async handleMeetingResponse(ctx: any, user: any, eventId: number, action: string) {
		const statusMap: Record<string, string> = {
			accept: 'accepted',
			decline: 'declined',
		};
		const newStatus = statusMap[action];
		if (!newStatus) return;

		const participant = await this.calendarEventParticipant.findUnique({
			where: { eventId_userId: { eventId, userId: user.id } },
			include: { event: true },
		});

		if (!participant) {
			await ctx.answerCbQuery('❌ Вы не являетесь участником этого события.');
			return;
		}

		await this.calendarEventParticipant.update({
			where: { eventId_userId: { eventId, userId: user.id } },
			data: { status: newStatus },
		});

		const label = newStatus === 'accepted' ? '✅ Принято' : '❌ Отклонено';
		const ev = participant.event as any;

		await ctx.answerCbQuery(label);
		await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		await ctx.reply(
			`${label}\n<b>${ev?.title || ''}</b>`,
			{ parse_mode: 'HTML' }
		);
	}

	private async handleEventStatusChange(ctx: any, user: any, eventId: number, action: string) {
		const statusMap: Record<string, string> = {
			done: 'completed',
			cancel: 'cancelled',
		};
		const newStatus = statusMap[action];
		if (!newStatus) return;

		const event = await this.calendarEvent.findUnique({ where: { id: eventId } });
		if (!event) {
			await ctx.answerCbQuery('❌ Событие не найдено.');
			return;
		}
		if (event.assigneeId !== user.id) {
			await ctx.answerCbQuery('❌ Нет доступа к этому событию.');
			return;
		}

		await this.calendarEvent.update({
			where: { id: eventId },
			data: { status: newStatus, ...(newStatus === 'completed' ? { completedAt: new Date() } : {}) },
		});

		const label = newStatus === 'completed' ? '✅ Готово' : '❌ Отменено';

		await ctx.answerCbQuery(label);
		await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		await ctx.reply(
			`${label}\n<b>${event.title}</b>`,
			{ parse_mode: 'HTML' }
		);
	}

	private async handleShowTaskDescription(ctx: any, user: any, taskId: number) {
		const task = await this.crmTask.findUnique({
			where: { id: taskId },
			include: { organization: true, author: true, assignee: true },
		});
		if (!task) {
			await ctx.answerCbQuery('❌ Задача не найдена.');
			return;
		}

		const statusLabels: Record<string, string> = {
			pending: '⏳ Ожидание',
			in_progress: '▶️ В работе',
			completed: '✅ Выполнено',
			cancelled: '❌ Отменено',
		};
		const priorityLabels: Record<string, string> = {
			low: '🔽 Низкий',
			normal: '▪️ Обычный',
			high: '🔼 Высокий',
			urgent: '🔴 Срочный',
		};

		const org = task.organization as any;
		const author = task.author as any;
		const assignee = task.assignee as any;

		let text = `📋 <b>${task.title}</b>\n`;
		text += `Статус: ${statusLabels[task.status] || task.status}\n`;
		if ((task as any).priority) text += `Приоритет: ${priorityLabels[(task as any).priority] || (task as any).priority}\n`;
		if ((task as any).deadline) {
			const zoned = utcToZonedTime(new Date((task as any).deadline), this.timeZone);
			text += `Дедлайн: ${format(zoned, 'd MMM yyyy, HH:mm', { locale: ru })}\n`;
		}
		if ((task as any).description) text += `\n📝 <i>${(task as any).description}</i>\n`;
		if (org) text += `\n🏢 ${org.nameRu || org.nameEn}\n`;
		if (author) text += `Автор: ${author.lastName || ''} ${author.firstName || ''}\n`;
		if (assignee) text += `Исполнитель: ${assignee.lastName || ''} ${assignee.firstName || ''}\n`;

		await ctx.answerCbQuery();
		await ctx.reply(text, { parse_mode: 'HTML' });
	}

	private async handleShowEventDescription(ctx: any, user: any, eventId: number) {
		const event = await this.calendarEvent.findUnique({
			where: { id: eventId },
			include: {
				organization: true,
				author: true,
				assignee: true,
				contact: true,
				participants: { include: { user: true } },
			},
		});
		if (!event) {
			await ctx.answerCbQuery('❌ Событие не найдено.');
			return;
		}

		const typeLabels: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
			note: '📝 Заметка',
			reminder: '🔔 Напоминание',
		};

		const ev = event as any;
		const isSentinel = ev.type === 'note' && new Date(ev.dateStart).getFullYear() === 2099;
		const zonedStart = utcToZonedTime(new Date(ev.dateStart), this.timeZone);
		const zonedEnd = utcToZonedTime(new Date(ev.dateEnd), this.timeZone);

		let text = `${typeLabels[ev.type] || ev.type}: <b>${ev.title}</b>\n`;
		if (isSentinel) {
			if (ev.createdAt) {
				const zonedCreated = utcToZonedTime(new Date(ev.createdAt), this.timeZone);
				text += `🕐 Создано: ${format(zonedCreated, 'd MMM yyyy, HH:mm', { locale: ru })}\n`;
			}
		} else {
			text += `📅 ${format(zonedStart, 'd MMM yyyy', { locale: ru })}\n`;
			text += `🕐 ${format(zonedStart, 'HH:mm', { locale: ru })} — ${format(zonedEnd, 'HH:mm', { locale: ru })}\n`;
		}
		if (ev.description) text += `\n📝 <i>${ev.description}</i>\n`;
		if (ev.location) text += `\n📍 ${ev.location}\n`;
		if (ev.organization) text += `🏢 ${ev.organization.nameRu || ev.organization.nameEn}\n`;
		if (ev.contact) text += `👤 Контакт: ${ev.contact.name}\n`;
		if (ev.author) text += `\nОрганизатор: ${ev.author.lastName || ''} ${ev.author.firstName || ''}\n`;
		if (ev.assignee) text += `Ответственный: ${ev.assignee.lastName || ''} ${ev.assignee.firstName || ''}\n`;
		const participants = ev.participants || [];
		if (participants.length > 0) {
			const names = participants
				.map((p: any) => `${p.user?.lastName || ''} ${p.user?.firstName || ''}`.trim())
				.join(', ');
			text += `👥 Участники: ${names}\n`;
		}

		await ctx.answerCbQuery();
		await ctx.reply(text, { parse_mode: 'HTML' });
	}

	// ==================== Private helpers ====================

	private async findUserByTelegramId(telegramId: number) {
		return this.user.findFirst({
			where: { telegramId: String(telegramId) },
			select: { id: true, firstName: true, lastName: true },
		});
	}

	// ==================== Public API ====================

	public async sendMessage(chatId: number, message: string): Promise<SendMessageTelegramEntity> {
		const result = await this.bot.telegram
			.sendMessage(chatId, message, { parse_mode: 'HTML' })
			.catch(() => true);
		return result as SendMessageTelegramEntity;
	}

	public async sendMessageWithKeyboard(
		chatId: number,
		message: string,
		keyboard: ReturnType<typeof Markup.inlineKeyboard>
	): Promise<void> {
		await this.bot.telegram
			.sendMessage(chatId, message, {
				parse_mode: 'HTML',
				reply_markup: keyboard.reply_markup,
			})
			.catch((err) => this.logger.error('Error sending message with keyboard:', err));
	}
}
