import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../common';
import { SendMessageTelegramEntity } from '../entity/send-message-telegram.entity';

@Injectable()
export class TelegramService extends PrismaService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(TelegramService.name);
	private readonly timeZone = 'Asia/Tashkent';
	private readonly botEnabled: boolean;
	bot: Telegraf;

	constructor() {
		super();
		const token = process.env.TELEGRAM_TOKEN;
		this.botEnabled = !!token && token !== 'disabled' && token.includes(':');
		this.bot = new Telegraf(this.botEnabled ? token : '0:placeholder');
		if (this.botEnabled) this.registerHandlers();
	}

	async onModuleInit() {
		if (!this.botEnabled) {
			this.logger.warn('Telegram bot disabled (no valid TELEGRAM_TOKEN)');
			return;
		}
		this.bot.launch().catch((err) => this.logger.error('Bot launch error:', err));
		this.logger.log('Telegram bot started (polling)');
	}

	async onModuleDestroy() {
		if (this.botEnabled) this.bot.stop('SIGTERM');
	}

	isBotEnabled(): boolean {
		return this.botEnabled;
	}

	// ==================== Handlers ====================

	private readonly menuKeyboard = Markup.keyboard([
		['📋 Мои задачи', '📅 Мои события'],
		['⚡ Статусы организаций'],
	]).resize();

	private registerHandlers() {
		this.bot.start((ctx) => this.handleStart(ctx));
		this.bot.hears('📋 Мои задачи', (ctx) => this.handleTasksMenu(ctx));
		this.bot.hears('📅 Мои события', (ctx) => this.handleEventsMenu(ctx));
		this.bot.hears('⚡ Статусы организаций', (ctx) => this.handlePowerStatusMenu(ctx));
		this.bot.on('callback_query', (ctx) => this.handleCallback(ctx));
	}

	private async handleStart(ctx: any) {
		await ctx.reply(
			`👋 Привет! Я бот <b>Back-Office</b>.\n\nВыберите нужный раздел:`,
			{ parse_mode: 'HTML', ...this.menuKeyboard }
		);
	}

	private async handleTasksMenu(ctx: any, page = 0) {
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
		});

		if (tasks.length === 0) {
			await ctx.reply('✅ У вас нет активных задач.', this.menuKeyboard);
			return;
		}

		const statusLabels: Record<string, string> = {
			pending: '⏳ Ожидание',
			in_progress: '▶️ В работе',
		};

		const pageSize = 5;
		const totalPages = Math.ceil(tasks.length / pageSize);
		const safePage = Math.max(0, Math.min(page, totalPages - 1));
		const pageTasks = tasks.slice(safePage * pageSize, safePage * pageSize + pageSize);

		let text = `📋 <b>Ваши активные задачи</b> (стр. ${safePage + 1}/${totalPages}, всего: ${tasks.length})\n\n`;

		pageTasks.forEach((task, i) => {
			const num = safePage * pageSize + i + 1;
			const org = task.organization as any;
			text += `${num}. <b>${task.title}</b>\n`;
			text += `   ${statusLabels[task.status] || task.status}`;
			if (org) text += ` | 🏢 ${org.nameRu || org.nameEn}`;
			if (task.deadline) {
				const zoned = utcToZonedTime(new Date(task.deadline), this.timeZone);
				text += ` | Дедлайн: ${format(zoned, 'd MMM yyyy', { locale: ru })}`;
			}
			text += '\n\n';
		});

		const rows: any[][] = [];
		for (const task of pageTasks) {
			const label = task.title.length > 30 ? task.title.slice(0, 28) + '…' : task.title;
			rows.push([Markup.button.callback(`📋 ${label}`, `tk:${task.id}:view`)]);
		}

		const navRow: any[] = [];
		if (safePage > 0) {
			navRow.push(Markup.button.callback('◀️ Назад', `tp:${safePage - 1}:list`));
		}
		if (safePage < totalPages - 1) {
			navRow.push(Markup.button.callback('▶️ Вперёд', `tp:${safePage + 1}:list`));
		}
		if (navRow.length > 0) rows.push(navRow);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
	}

	private async handleTaskDetail(ctx: any, user: any, taskId: number) {
		const task = await this.crmTask.findUnique({
			where: { id: taskId },
			include: { organization: true },
		});

		if (!task) {
			await ctx.reply('❌ Задача не найдена.');
			return;
		}

		const statusLabels: Record<string, string> = {
			pending: '⏳ Ожидание',
			in_progress: '▶️ В работе',
			completed: '✅ Выполнено',
			cancelled: '❌ Отменено',
		};

		const org = task.organization as any;

		let text = `📋 <b>${task.title}</b>\n`;
		text += `Статус: ${statusLabels[task.status] || task.status}\n`;
		if (org) text += `🏢 ${org.nameRu || org.nameEn}\n`;
		if (task.deadline) {
			const zoned = utcToZonedTime(new Date(task.deadline), this.timeZone);
			text += `Дедлайн: ${format(zoned, 'd MMM yyyy, HH:mm', { locale: ru })}\n`;
		}
		if ((task as any).description) text += `\n📝 <i>${(task as any).description}</i>\n`;

		const rows: any[][] = [];
		const row1: any[] = [];
		if (task.status === 'pending') {
			row1.push(Markup.button.callback('▶️ В работе', `ts:${task.id}:wip`));
		}
		row1.push(Markup.button.callback('✅ Выполнено', `ts:${task.id}:done`));
		rows.push(row1);
		rows.push([Markup.button.callback('🔍 Описание', `td:${task.id}:info`)]);
		rows.push([Markup.button.callback('◀️ К списку', `tp:0:list`)]);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
	}

	private async handleEventsMenu(ctx: any, page = 0) {
		const user = await this.findUserByTelegramId(ctx.from.id);
		if (!user) {
			await ctx.reply('❌ Ваш Telegram не привязан к аккаунту в системе.');
			return;
		}

		const now = new Date();
		const in7Days = new Date(now);
		in7Days.setDate(in7Days.getDate() + 7);

		const typeLabels: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
		};

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
		});

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
		});

		// Объединяем: сначала приглашения, потом свои события
		const items: { id: number; title: string; type: string; dateStart: Date; orgName: string; isInvitation: boolean }[] = [];

		for (const inv of myInvitations) {
			const ev = inv.event as any;
			const org = ev.organization as any;
			items.push({
				id: ev.id,
				title: ev.title,
				type: ev.type,
				dateStart: new Date(ev.dateStart),
				orgName: org ? (org.nameRu || org.nameEn) : '',
				isInvitation: true,
			});
		}

		for (const event of myEvents) {
			const org = event.organization as any;
			items.push({
				id: event.id,
				title: event.title,
				type: event.type,
				dateStart: new Date(event.dateStart),
				orgName: org ? (org.nameRu || org.nameEn) : '',
				isInvitation: false,
			});
		}

		if (items.length === 0) {
			await ctx.reply('📅 Нет предстоящих событий на ближайшую неделю.', this.menuKeyboard);
			return;
		}

		const pageSize = 5;
		const totalPages = Math.ceil(items.length / pageSize);
		const safePage = Math.max(0, Math.min(page, totalPages - 1));
		const pageItems = items.slice(safePage * pageSize, safePage * pageSize + pageSize);

		let text = `📅 <b>Мои события</b> (стр. ${safePage + 1}/${totalPages}, всего: ${items.length})\n\n`;

		pageItems.forEach((item, i) => {
			const num = safePage * pageSize + i + 1;
			const icon = item.isInvitation ? '📨' : '📅';
			const typeLabel = typeLabels[item.type] || item.type;
			const zoned = utcToZonedTime(item.dateStart, this.timeZone);
			text += `${icon} ${num}. ${typeLabel}: <b>${item.title}</b>\n`;
			text += `   🕐 ${format(zoned, 'd MMM, HH:mm', { locale: ru })}`;
			if (item.orgName) text += ` | 🏢 ${item.orgName}`;
			if (item.isInvitation) text += ` | ⏳ Ожидает ответа`;
			text += '\n\n';
		});

		const rows: any[][] = [];
		for (const item of pageItems) {
			const label = item.title.length > 30 ? item.title.slice(0, 28) + '…' : item.title;
			const action = item.isInvitation ? 'inv' : 'own';
			rows.push([Markup.button.callback(`📅 ${label}`, `ek:${item.id}:${action}`)]);
		}

		const navRow: any[] = [];
		if (safePage > 0) {
			navRow.push(Markup.button.callback('◀️ Назад', `ep:${safePage - 1}:list`));
		}
		if (safePage < totalPages - 1) {
			navRow.push(Markup.button.callback('▶️ Вперёд', `ep:${safePage + 1}:list`));
		}
		if (navRow.length > 0) rows.push(navRow);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
	}

	private async handleEventDetail(ctx: any, user: any, eventId: number, isInvitation: boolean) {
		const event = await this.calendarEvent.findUnique({
			where: { id: eventId },
			include: { organization: true },
		});

		if (!event) {
			await ctx.reply('❌ Событие не найдено.');
			return;
		}

		const typeLabels: Record<string, string> = {
			meeting: '📅 Встреча',
			call: '📞 Звонок',
		};

		const ev = event as any;
		const org = ev.organization as any;
		const zoned = utcToZonedTime(new Date(ev.dateStart), this.timeZone);

		let text = `${typeLabels[ev.type] || ev.type}: <b>${ev.title}</b>\n`;
		text += `🕐 ${format(zoned, 'd MMM yyyy, HH:mm', { locale: ru })}\n`;
		if (org) text += `🏢 ${org.nameRu || org.nameEn}\n`;
		if (ev.description) text += `\n📝 <i>${ev.description}</i>\n`;

		const rows: any[][] = [];
		if (isInvitation) {
			rows.push([
				Markup.button.callback('✅ Принять', `me:${ev.id}:accept`),
				Markup.button.callback('❌ Отклонить', `me:${ev.id}:decline`),
			]);
		} else {
			rows.push([
				Markup.button.callback('✅ Готово', `ev:${ev.id}:done`),
				Markup.button.callback('❌ Отменено', `ev:${ev.id}:cancel`),
			]);
		}
		rows.push([Markup.button.callback('🔍 Описание', `ev:${ev.id}:info`)]);
		rows.push([Markup.button.callback('◀️ К списку', `ep:0:list`)]);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
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
			if (prefix === 'tp') {
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handleTasksMenu(ctx, entityId);
			} else if (prefix === 'tk') {
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handleTaskDetail(ctx, user, entityId);
			} else if (prefix === 'ep') {
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handleEventsMenu(ctx, entityId);
			} else if (prefix === 'ek') {
				const isInvitation = action === 'inv';
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handleEventDetail(ctx, user, entityId, isInvitation);
			} else if (prefix === 'ts') {
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
			} else if (prefix === 'pg') {
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handlePowerStatusMenu(ctx, entityId);
			} else if (prefix === 'po') {
				await ctx.answerCbQuery();
				try { await ctx.deleteMessage(); } catch {}
				await this.handlePowerOrgDetail(ctx, entityId);
			} else if (prefix === 'pw') {
				await this.handlePowerContactCall(ctx, entityId);
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

	private async handlePowerOrgDetail(ctx: any, orgId: number) {
		const org = await this.crmOrganization.findUnique({
			where: { id: orgId },
			include: {
				contacts: {
					include: { phones: true },
				},
			},
		});

		if (!org) {
			await ctx.reply('❌ Организация не найдена.');
			return;
		}

		const statusLabels: Record<string, string> = {
			full: '🟢 Активные',
			medium: '🟡 Теплые',
			low: '🟠 Холодные',
			empty: '🔴 Потерянные',
		};

		const orgName = (org as any).nameRu || (org as any).nameEn || `#${org.id}`;
		let text = `🏢 <b>${orgName}</b>\n`;

		if ((org as any).last1CUpdate) {
			const info = this.calculatePowerInfo(new Date((org as any).last1CUpdate));
			if (info) {
				text += `${statusLabels[info.currentStatus]} → через ${info.daysLeft} дн. ${statusLabels[info.nextStatus]}\n`;
			}
		}

		const contacts = (org as any).contacts || [];
		const rows: any[][] = [];

		if (contacts.length > 0) {
			text += `\n`;
			for (const contact of contacts) {
				const position = contact.position ? ` — ${contact.position}` : '';
				text += `👤 ${contact.name}${position}\n`;
				rows.push([Markup.button.callback(`📞 ${contact.name}`, `pw:${contact.id}:call`)]);
			}
		} else {
			text += `\n📭 Нет контактов\n`;
			const frontendUrl = process.env.DOMAIN_FRONTEND?.replace(/\/$/, '') || 'http://back-office.uz';
			rows.push([Markup.button.url('➕ Добавить контакт', `${frontendUrl}/crm/organization/${orgId}`)]);
		}

		rows.push([Markup.button.callback('◀️ К списку', `pg:0:list`)]);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
	}

	private async handlePowerContactCall(ctx: any, contactId: number) {
		const contact = await this.crmContact.findUnique({
			where: { id: contactId },
			include: { phones: true },
		});

		if (!contact) {
			await ctx.answerCbQuery('❌ Контакт не найден.');
			return;
		}

		const phones = (contact as any).phones || [];
		if (phones.length === 0) {
			await ctx.answerCbQuery('❌ Нет номера телефона.');
			return;
		}

		let text = `📞 <b>${contact.name}</b>\n\n`;
		for (const phone of phones) {
			text += `📱 <code>${phone.value}</code>\n`;
		}

		await ctx.answerCbQuery();
		await ctx.reply(text, { parse_mode: 'HTML' });
	}

	private calculatePowerInfo(lastUpdate: Date): {
		currentStatus: string;
		nextStatus: string;
		daysLeft: number;
	} | null {
		const daysSince = differenceInDays(new Date(), lastUpdate);

		if (daysSince < 30) {
			return { currentStatus: 'full', nextStatus: 'medium', daysLeft: 30 - daysSince };
		} else if (daysSince < 60) {
			return { currentStatus: 'medium', nextStatus: 'low', daysLeft: 60 - daysSince };
		} else if (daysSince < 90) {
			return { currentStatus: 'low', nextStatus: 'empty', daysLeft: 90 - daysSince };
		}
		return null;
	}

	private async handlePowerStatusMenu(ctx: any, page = 0) {
		const user = await this.findUserByTelegramId(ctx.from.id);
		if (!user) {
			await ctx.reply('❌ Ваш Telegram не привязан к аккаунту в системе.');
			return;
		}

		const SENTINEL_DATE = new Date('1990-08-19');

		const organizations = await this.crmOrganization.findMany({
			where: {
				userId: user.id,
				last1CUpdate: { not: null },
			},
			select: { id: true, nameRu: true, nameEn: true, last1CUpdate: true },
		});

		const statusLabels: Record<string, string> = {
			full: '🟢 Активные',
			medium: '🟡 Теплые',
			low: '🟠 Холодные',
			empty: '🔴 Потерянные',
		};

		const items: { id: number; name: string; currentStatus: string; nextStatus: string; daysLeft: number }[] = [];

		for (const org of organizations) {
			const lastUpdate = new Date(org.last1CUpdate);
			if (lastUpdate.getTime() === SENTINEL_DATE.getTime()) continue;

			const info = this.calculatePowerInfo(lastUpdate);
			if (!info) continue;

			items.push({
				id: org.id,
				name: org.nameRu || org.nameEn || `#${org.id}`,
				currentStatus: info.currentStatus,
				nextStatus: info.nextStatus,
				daysLeft: info.daysLeft,
			});
		}

		items.sort((a, b) => a.daysLeft - b.daysLeft);

		if (items.length === 0) {
			await ctx.reply('✅ Все организации в актуальном статусе.', this.menuKeyboard);
			return;
		}

		const pageSize = 5;
		const totalPages = Math.ceil(items.length / pageSize);
		const safePage = Math.max(0, Math.min(page, totalPages - 1));
		const pageItems = items.slice(safePage * pageSize, safePage * pageSize + pageSize);

		let text = `⚡ <b>Статусы организаций</b> (стр. ${safePage + 1}/${totalPages}, всего: ${items.length})\n\n`;

		pageItems.forEach((item, i) => {
			const num = safePage * pageSize + i + 1;
			text += `${num}. <b>${item.name}</b>\n`;
			text += `   ${statusLabels[item.currentStatus]} → через ${item.daysLeft} дн. ${statusLabels[item.nextStatus]}\n\n`;
		});

		const rows: any[][] = [];
		for (const item of pageItems) {
			const label = item.name.length > 30 ? item.name.slice(0, 28) + '…' : item.name;
			rows.push([Markup.button.callback(`🏢 ${label}`, `po:${item.id}:view`)]);
		}

		const navRow: any[] = [];
		if (safePage > 0) {
			navRow.push(Markup.button.callback('◀️ Назад', `pg:${safePage - 1}:list`));
		}
		if (safePage < totalPages - 1) {
			navRow.push(Markup.button.callback('▶️ Вперёд', `pg:${safePage + 1}:list`));
		}
		if (navRow.length > 0) rows.push(navRow);

		await ctx.reply(text, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard(rows),
		});
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
	): Promise<any> {
		return await this.bot.telegram
			.sendMessage(chatId, message, {
				parse_mode: 'HTML',
				reply_markup: keyboard.reply_markup,
			})
			.catch((err) => this.logger.error('Error sending message with keyboard:', err));
	}

	public async deleteMessage(chatId: number, messageId: number): Promise<void> {
		await this.bot.telegram
			.deleteMessage(chatId, messageId)
			.catch((err) => this.logger.error('Error deleting message:', err));
	}

	public async editMessage(
		chatId: number,
		messageId: number,
		text: string,
		keyboard: ReturnType<typeof Markup.inlineKeyboard>,
	): Promise<void> {
		await this.bot.telegram
			.editMessageText(chatId, messageId, undefined, text, {
				parse_mode: 'HTML',
				reply_markup: keyboard.reply_markup,
			})
			.catch((err) => this.logger.error('Error editing message:', err));
	}
}
