import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PrismaService } from '../../common';
import { TelegramService } from '../../notification/services/telegram.service';
import { MutationTaskDto } from '../dto/mutation-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { TaskEntity } from '../entity/task.entity';
import { TaskConstants } from '../constants/task.constants';

interface TaskFilter {
	orderBy?: { [key: string]: 'asc' | 'desc' };
	take?: number;
	skip?: number;
}

@Injectable()
export class TaskService extends PrismaService {
	private readonly priorityLabels: Record<string, string> = {
		low: '🟢 Низкий',
		normal: '🔵 Обычный',
		high: '🟠 Высокий',
		urgent: '🔴 Срочный',
	};

	private readonly statusLabels: Record<string, string> = {
		pending: '⏳ Ожидает',
		in_progress: '🔄 В работе',
		completed: '✅ Выполнена',
		cancelled: '❌ Отменена',
	};

	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	create = async ({ createDto, currentUserId }: { createDto: MutationTaskDto; currentUserId?: number }): Promise<TaskEntity> => {
		// Проверка прав: можно создавать задачи только в своих организациях
		// (где пользователь является ответственным менеджером)
		if (createDto.organizationId && currentUserId) {
			const canCreate = await this.canCreateTaskInOrganization(currentUserId, Number(createDto.organizationId));
			if (!canCreate) {
				throw new HttpException(TaskConstants.FORBIDDEN_NOT_MANAGER, HttpStatus.FORBIDDEN);
			}
		}

		const data = {
			title: createDto.title,
			description: createDto.description,
			status: createDto.status || 'pending',
			priority: createDto.priority || 'normal',
			deadline: createDto.deadline ? new Date(createDto.deadline) : null,
			authorId: Number(createDto.authorId),
			assigneeId: Number(createDto.assigneeId),
			organizationId: createDto.organizationId ? Number(createDto.organizationId) : null,
		};

		const task = await this.crmTask.create({
			data,
			include: {
				author: true,
				assignee: true,
				organization: true,
			},
		});

		// Отправить уведомление исполнителю, если автор != исполнитель
		if (data.authorId !== data.assigneeId && task.assignee?.telegramId) {
			await this.sendTaskAssignedNotification(task);
		}

		return task;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<TaskEntity> => {
		return this.crmTask.findUnique({
			where: { id: Number(id) },
			include: include || {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
		});
	};

	findOnce = async ({
		where,
		filter,
		include,
	}: {
		where: QueryTaskDto;
		filter?: TaskFilter;
		include?: Record<string, boolean>;
	}): Promise<TaskEntity> => {
		const parsedWhere = this.parseWhere(where);
		return this.crmTask.findFirst({
			where: parsedWhere,
			include: include || {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
			...filter,
		});
	};

	findMany = async ({
		where,
		filter,
		include,
	}: {
		where: QueryTaskDto;
		filter?: TaskFilter;
		include?: Record<string, boolean>;
	}): Promise<TaskEntity[]> => {
		const parsedWhere = this.parseWhere(where);
		return this.crmTask.findMany({
			where: parsedWhere,
			include: include || {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
			orderBy: filter?.orderBy || { createdAt: 'desc' },
			take: filter?.take,
			skip: filter?.skip,
		});
	};

	getByOrganizationId = async (id: number | string): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: { organizationId: Number(id) },
			include: {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	};

	getByAssigneeId = async (id: number | string): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: { assigneeId: Number(id) },
			include: {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	};

	getMyTasks = async (userId: number): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: {
				OR: [{ assigneeId: userId }, { authorId: userId }],
			},
			include: {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	};

	updateById = async ({
		id,
		updateDto,
		currentUserId,
	}: {
		id: number | string;
		updateDto: Partial<MutationTaskDto>;
		currentUserId?: number;
	}): Promise<TaskEntity> => {
		const task = await this.findById(id);
		if (!task) throw new HttpException(TaskConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Проверка прав
		if (currentUserId) {
			const canModify = await this.canModifyTask(currentUserId, task);
			const isAssignee = task.assigneeId === currentUserId;

			// Исполнитель может менять только статус
			if (!canModify && isAssignee) {
				const allowedFields = ['status'];
				const requestedFields = Object.keys(updateDto);
				const hasDisallowedFields = requestedFields.some((field) => !allowedFields.includes(field));
				if (hasDisallowedFields) {
					throw new HttpException(TaskConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
				}
			}

			// Не автор и не исполнитель — запрет
			if (!canModify && !isAssignee) {
				throw new HttpException(TaskConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		const data: any = {};
		const changes: string[] = [];

		if (updateDto.title !== undefined && updateDto.title !== task.title) {
			data.title = updateDto.title;
			changes.push(`Заголовок: "${task.title}" → "${updateDto.title}"`);
		}
		if (updateDto.description !== undefined && updateDto.description !== task.description) {
			data.description = updateDto.description;
			changes.push('Описание изменено');
		}
		if (updateDto.status !== undefined && updateDto.status !== task.status) {
			data.status = updateDto.status;
			changes.push(`Статус: ${this.statusLabels[task.status] || task.status} → ${this.statusLabels[updateDto.status] || updateDto.status}`);
		}
		if (updateDto.priority !== undefined && updateDto.priority !== task.priority) {
			data.priority = updateDto.priority;
			changes.push(`Приоритет: ${this.priorityLabels[task.priority] || task.priority} → ${this.priorityLabels[updateDto.priority] || updateDto.priority}`);
		}
		if (updateDto.deadline !== undefined) {
			const newDeadline = updateDto.deadline ? new Date(updateDto.deadline) : null;
			const oldDeadline = task.deadline ? new Date(task.deadline).toISOString() : null;
			const newDeadlineStr = newDeadline ? newDeadline.toISOString() : null;
			if (oldDeadline !== newDeadlineStr) {
				data.deadline = newDeadline;
				changes.push('Дедлайн изменён');
			}
		}
		if (updateDto.assigneeId !== undefined && Number(updateDto.assigneeId) !== task.assigneeId) {
			data.assigneeId = Number(updateDto.assigneeId);
			changes.push('Исполнитель изменён');
		}
		if (updateDto.organizationId !== undefined) {
			const newOrgId = updateDto.organizationId ? Number(updateDto.organizationId) : null;
			if (newOrgId !== task.organizationId) {
				data.organizationId = newOrgId;
				changes.push('Организация изменена');
			}
		}

		// Обновить задачу
		await this.crmTask.update({
			where: { id: Number(id) },
			data,
		});

		// Создать запись модификации если были изменения и известен пользователь
		if (changes.length > 0 && currentUserId) {
			await this.crmTaskModification.create({
				data: {
					taskId: Number(id),
					modifiedById: currentUserId,
					changes: JSON.stringify(changes),
				},
			});

			// Отправить уведомление исполнителю, если задачу изменил не он сам
			if (currentUserId !== task.assigneeId && task.assignee?.telegramId) {
				await this.sendTaskModifiedNotification(task, changes, currentUserId);
			}
		}

		// Вернуть задачу с включёнными модификациями
		return this.crmTask.findUnique({
			where: { id: Number(id) },
			include: {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
		});
	};

	updateStatus = async (id: number | string, status: string, currentUserId?: number): Promise<TaskEntity> => {
		const task = await this.findById(id);
		if (!task) throw new HttpException(TaskConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Проверка прав: можно менять статус только своих задач (где ты автор)
		// или задач назначенных тебе (исполнитель может отметить выполнение)
		if (currentUserId) {
			const canModify = await this.canModifyTask(currentUserId, task);
			const isAssignee = task.assigneeId === currentUserId;
			if (!canModify && !isAssignee) {
				throw new HttpException(TaskConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		const oldStatus = task.status;
		const data: any = { status };
		if (status === 'completed') {
			data.completedAt = new Date();
		}

		// Обновить статус
		await this.crmTask.update({
			where: { id: Number(id) },
			data,
		});

		// Создать запись модификации если статус изменился
		if (oldStatus !== status && currentUserId) {
			const statusChangeText = `Статус: ${this.statusLabels[oldStatus] || oldStatus} → ${this.statusLabels[status] || status}`;
			await this.crmTaskModification.create({
				data: {
					taskId: Number(id),
					modifiedById: currentUserId,
					changes: JSON.stringify([statusChangeText]),
				},
			});

			// Отправить уведомление исполнителю, если статус изменил не он сам
			if (currentUserId !== task.assigneeId && task.assignee?.telegramId) {
				await this.sendTaskModifiedNotification(task, [statusChangeText], currentUserId);
			}
		}

		// Вернуть задачу с включёнными модификациями
		return this.crmTask.findUnique({
			where: { id: Number(id) },
			include: {
				author: true,
				assignee: true,
				organization: true,
				modifications: {
					include: { modifiedBy: true },
					orderBy: { createdAt: 'desc' },
					take: 2,
				},
			},
		});
	};

	deleteById = async (id: number | string, currentUserId?: number): Promise<TaskEntity> => {
		const task = await this.findById(id);
		if (!task) throw new HttpException(TaskConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Проверка прав: можно удалять только свои задачи (где ты автор)
		if (currentUserId) {
			const canModify = await this.canModifyTask(currentUserId, task);
			if (!canModify) {
				throw new HttpException(TaskConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		return this.crmTask.delete({ where: { id: Number(id) } });
	};

	// Методы для cron-сервисов
	findTasksWithUpcomingDeadline = async (
		hoursOrDays: number,
		unit: 'hours' | 'days',
		reminderField: 'reminderSent3Days' | 'reminderSent1Day' | 'reminderSent2Hours'
	): Promise<TaskEntity[]> => {
		const now = new Date();
		const targetDate = new Date(now);

		if (unit === 'days') {
			targetDate.setDate(targetDate.getDate() + hoursOrDays);
		} else {
			targetDate.setHours(targetDate.getHours() + hoursOrDays);
		}

		return this.crmTask.findMany({
			where: {
				deadline: {
					lte: targetDate,
					gt: now,
				},
				status: { notIn: ['completed', 'cancelled'] },
				[reminderField]: false,
			},
			include: { author: true, assignee: true, organization: true },
		});
	};

	findOverdueTasks = async (): Promise<TaskEntity[]> => {
		const now = new Date();

		return this.crmTask.findMany({
			where: {
				deadline: { lt: now },
				status: { notIn: ['completed', 'cancelled'] },
				overdueNotified: false,
			},
			include: { author: true, assignee: true, organization: true },
		});
	};

	markReminderSent = async (id: number, field: 'reminderSent3Days' | 'reminderSent1Day' | 'reminderSent2Hours'): Promise<void> => {
		await this.crmTask.update({
			where: { id },
			data: { [field]: true },
		});
	};

	markOverdueNotified = async (id: number): Promise<void> => {
		await this.crmTask.update({
			where: { id },
			data: { overdueNotified: true },
		});
	};

	// ------------------------------
	// Private методы
	// ------------------------------

	private parseWhere = (where: QueryTaskDto): any => {
		const result: any = {};

		if (where.id) result.id = Number(where.id);
		if (where.title) result.title = { contains: where.title, mode: 'insensitive' };
		if (where.status) {
			if (Array.isArray(where.status)) {
				result.status = { in: where.status };
			} else {
				result.status = where.status;
			}
		}
		if (where.priority) {
			if (Array.isArray(where.priority)) {
				result.priority = { in: where.priority };
			} else {
				result.priority = where.priority;
			}
		}
		if (where.authorId) result.authorId = Number(where.authorId);
		if (where.assigneeId) result.assigneeId = Number(where.assigneeId);
		if (where.organizationId) result.organizationId = Number(where.organizationId);

		return result;
	};

	private throwNotFoundError = async (id: number | string): Promise<void> => {
		const findItem = await this.findById(id);
		if (!findItem) throw new HttpException(TaskConstants.NOT_FOUND, HttpStatus.NOT_FOUND);
	};

	/**
	 * Проверка: может ли пользователь создавать задачи в организации
	 * Условие: пользователь является ответственным менеджером организации ИЛИ имеет роль boss/admin/developer
	 */
	private canCreateTaskInOrganization = async (userId: number, organizationId: number): Promise<boolean> => {
		// Проверить роли пользователя (boss, admin, developer могут создавать везде)
		const user = await this.user.findUnique({
			where: { id: userId },
			include: { roles: true },
		});

		if (user?.roles?.some((role) => ['boss', 'admin', 'developer', 'crmAdmin'].includes(role.alias))) {
			return true;
		}

		// Проверить, является ли пользователь ответственным менеджером организации
		const organization = await this.crmOrganization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return false;
		}

		return organization.userId === userId;
	};

	/**
	 * Проверка: может ли пользователь редактировать/удалять задачу
	 * Условие: пользователь является автором задачи ИЛИ имеет роль boss/admin/developer
	 */
	private canModifyTask = async (userId: number, task: TaskEntity): Promise<boolean> => {
		// Проверить роли пользователя (boss, admin, developer могут редактировать все)
		const user = await this.user.findUnique({
			where: { id: userId },
			include: { roles: true },
		});

		if (user?.roles?.some((role) => ['boss', 'admin', 'developer', 'crmAdmin'].includes(role.alias))) {
			return true;
		}

		// Проверить, является ли пользователь автором задачи
		return task.authorId === userId;
	};

	private sendTaskAssignedNotification = async (task: TaskEntity): Promise<void> => {
		const assignee = task.assignee as any;
		if (!assignee?.telegramId) return;

		const author = task.author as any;
		const organization = task.organization as any;

		let message = `📌 <b>${assignee?.firstName || ''}</b>, вам назначена новая задача!\n\n`;
		message += `<b>От кого:</b> ${author?.firstName || ''} ${author?.lastName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n`;
		message += `<b>Приоритет:</b> ${this.priorityLabels[task.priority] || task.priority}\n`;

		if (task.deadline) {
			message += `<b>Дедлайн:</b> ${format(new Date(task.deadline), 'd MMMM yyyy, HH:mm', { locale: ru })}\n`;
		}

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		try {
			await this.telegramService.sendMessage(Number(assignee.telegramId), message);
		} catch (error) {
			console.error('Ошибка отправки Telegram уведомления о назначении задачи:', error);
		}
	};

	private sendTaskModifiedNotification = async (task: TaskEntity, changes: string[], modifiedById: number): Promise<void> => {
		const assignee = task.assignee as any;
		if (!assignee?.telegramId) return;

		// Получить информацию о том, кто изменил задачу
		const modifiedBy = await this.user.findUnique({
			where: { id: modifiedById },
		});

		const organization = task.organization as any;

		let message = `✏️ <b>${assignee?.firstName || ''}</b>, ваша задача была изменена!\n\n`;
		message += `<b>Кем:</b> ${modifiedBy?.firstName || ''} ${modifiedBy?.lastName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n\n`;
		message += `<b>Что изменилось:</b>\n`;

		for (const change of changes) {
			message += `• ${change}\n`;
		}

		if (organization) {
			message += `\n<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		try {
			await this.telegramService.sendMessage(Number(assignee.telegramId), message);
		} catch (error) {
			console.error('Ошибка отправки Telegram уведомления об изменении задачи:', error);
		}
	};
}
