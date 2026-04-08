import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../common';
import { TelegramService } from '../../notification/services/telegram.service';
import { CronDailySummaryService } from '../../notification/services/cron/daily-summary';
import { MutationTaskDto } from '../dto/mutation-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { TaskEntity } from '../entity/task.entity';
import { TaskConstants } from '../constants/task.constants';
import { ROLE_HIERARCHY, SUPER_ADMIN_ROLES, BOSS_ROLE, CRM_ADMIN_ROLE } from '../constants/role-hierarchy.constants';

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

	constructor(
		private readonly telegramService: TelegramService,
		private readonly dailySummaryService: CronDailySummaryService,
	) {
		super();
	}

	create = async ({ createDto, currentUserId }: { createDto: MutationTaskDto; currentUserId?: number }): Promise<TaskEntity> => {
		// Проверка прав: организация
		if (createDto.organizationId && currentUserId) {
			const canCreate = await this.canCreateTaskInOrganization(currentUserId, Number(createDto.organizationId));
			if (!canCreate) {
				throw new HttpException(TaskConstants.FORBIDDEN_NOT_MANAGER, HttpStatus.FORBIDDEN);
			}
		}

		// Проверка прав: можно ли создавать задачи для данного пользователя (по иерархии ролей)
		if (currentUserId && createDto.assigneeId) {
			const canCreateForUser = await this.canCreateTaskForUser(currentUserId, Number(createDto.assigneeId));
			if (!canCreateForUser) {
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
				organization: true,
			},
		});

		// Отправить уведомление исполнителю, если автор != исполнитель
		if (data.authorId !== data.assigneeId && task.assignee?.telegramId) {
			await this.sendTaskAssignedNotification(task);
		}

		// Обновить утреннюю сводку исполнителя
		this.dailySummaryService.refreshSummaryForUser(data.assigneeId).catch(() => {});

		return task;
	};

	findById = async (id: number | string, include?: Record<string, boolean>): Promise<TaskEntity> => {
		return this.crmTask.findUnique({
			where: { id: Number(id) },
			include: include || {
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
			// Если задача отменена или выполнена — редактирование полей закрыто для всех
			// Статус можно менять только через отдельный endpoint updateStatus
			if (task.status === 'cancelled' || task.status === 'completed') {
				throw new HttpException('Редактирование закрыто для отменённых и выполненных задач. Сначала измените статус.', HttpStatus.FORBIDDEN);
			}

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

				// Исполнитель может ставить только "в работе" и "выполнена",
				// если он НЕ автор, НЕ super admin, НЕ boss и НЕ руководитель (head role)
				if (updateDto.status && task.authorId !== currentUserId) {
					const hasFullStatusAccess = await this.hasFullStatusAccess(currentUserId, task);
					if (!hasFullStatusAccess) {
						const allowedStatuses = ['in_progress', 'completed'];
						if (!allowedStatuses.includes(updateDto.status)) {
							throw new HttpException('Исполнитель может устанавливать только статусы "В работе" и "Выполнена"', HttpStatus.FORBIDDEN);
						}
					}
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
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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

			// Исполнитель (не автор, не руководитель) — ограничения по статусам
			if (isAssignee && task.authorId !== currentUserId) {
				const hasFullStatusAccess = await this.hasFullStatusAccess(currentUserId, task);
				if (!hasFullStatusAccess) {
					// Если задача отменена или выполнена — подчинённый не может менять статус вообще
					if (task.status === 'cancelled' || task.status === 'completed') {
						throw new HttpException('Изменить статус отменённой или выполненной задачи может только руководитель', HttpStatus.FORBIDDEN);
					}
					// Иначе подчинённый может ставить только "в работе" и "выполнена"
					const allowedStatuses = ['in_progress', 'completed'];
					if (!allowedStatuses.includes(status)) {
						throw new HttpException('Исполнитель может устанавливать только статусы "В работе" и "Выполнена"', HttpStatus.FORBIDDEN);
					}
				}
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

			// Уведомить автора (руководителя) если статус изменил исполнитель
			if (currentUserId !== task.authorId && task.author?.telegramId) {
				await this.sendTaskStatusNotificationToAuthor(task, statusChangeText, currentUserId);
			}
		}

		// Вернуть задачу с включёнными модификациями
		return this.crmTask.findUnique({
			where: { id: Number(id) },
			include: {
				author: { include: { roles: true } },
				assignee: { include: { roles: true } },
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
			include: { author: { include: { roles: true } }, assignee: { include: { roles: true } }, organization: true },
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
			include: { author: { include: { roles: true } }, assignee: { include: { roles: true } }, organization: true },
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

	/**
	 * Проверка: имеет ли пользователь полный доступ ко всем статусам задачи
	 * (ожидание, в работе, выполнена, отменена)
	 *
	 * Полный доступ: admin/developer, boss, родительские роли (head roles)
	 * НЕ включает crmAdmin — они подчиняются тем же ограничениям, что и обычные исполнители
	 */
	private hasFullStatusAccess = async (userId: number, task: TaskEntity): Promise<boolean> => {
		const user = await this.getUserWithRolesAndChildren(userId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer — полный доступ
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) return true;

		// boss — полный доступ
		if (userRoleAliases.includes(BOSS_ROLE)) return true;

		// Руководитель (head role) для исполнителя задачи
		const assignee = task.assignee as any;
		const assigneeRoleAliases = (assignee?.roles || []).map((r: any) => r.alias || r);
		for (const headRole of userRoleAliases) {
			const childRole = ROLE_HIERARCHY[headRole];
			if (childRole && assigneeRoleAliases.includes(childRole)) return true;
		}

		// Родитель исполнителя (через _user_child)
		if (user.child?.some((child) => child.id === task.assigneeId)) return true;

		return false;
	};

	/**
	 * Получить пользователя с ролями и подчинёнными
	 */
	private getUserWithRolesAndChildren = async (userId: number) => {
		return this.user.findUnique({
			where: { id: userId },
			include: { roles: true, child: true },
		});
	};

	/**
	 * Проверить, является ли пользователь Boss
	 */
	private isUserBoss = async (userId: number): Promise<boolean> => {
		const user = await this.user.findUnique({
			where: { id: userId },
			include: { roles: true },
		});
		return user?.roles?.some((role) => role.alias === BOSS_ROLE) || false;
	};

	/**
	 * Проверка: может ли пользователь создавать задачи в организации
	 *
	 * Правила:
	 * 1. admin/developer — везде
	 * 2. boss — везде, кроме организаций boss-ов
	 * 3. crmAdmin — везде, кроме boss
	 * 4. Главная роль — может создавать задачи для дочерних ролей
	 * 5. Ответственный менеджер организации
	 * 6. Дочерняя роль — для подчинённых (через _user_child)
	 */
	private canCreateTaskInOrganization = async (userId: number, organizationId: number): Promise<boolean> => {
		const user = await this.getUserWithRolesAndChildren(userId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer — полный доступ
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) {
			return true;
		}

		// boss — полный доступ
		if (userRoleAliases.includes(BOSS_ROLE)) {
			return true;
		}

		// crmAdmin — полный доступ
		if (userRoleAliases.includes(CRM_ADMIN_ROLE)) {
			return true;
		}

		// Проверить, является ли пользователь ответственным менеджером организации
		const organization = await this.crmOrganization.findUnique({
			where: { id: organizationId },
		});

		if (organization && organization.userId === userId) {
			return true;
		}

		// Старший менеджер может создавать задачи в организациях своих подчинённых
		if (organization && organization.userId) {
			// Проверка через _user_child (прямой подчинённый)
			if (user.child?.some((child) => child.id === organization.userId)) {
				return true;
			}

			// Проверка через ROLE_HIERARCHY (head role → child role)
			const orgUser = await this.user.findUnique({
				where: { id: organization.userId },
				include: { roles: true },
			});
			if (orgUser?.roles) {
				const orgUserRoleAliases = orgUser.roles.map((r) => r.alias);
				for (const headRole of userRoleAliases) {
					const childRole = ROLE_HIERARCHY[headRole];
					if (childRole && orgUserRoleAliases.includes(childRole)) {
						return true;
					}
				}
			}
		}

		return false;
	};

	/**
	 * Проверка: может ли пользователь создавать задачу для другого пользователя
	 * (без привязки к организации)
	 *
	 * Правила аналогичны canCreateEventForUser
	 */
	private canCreateTaskForUser = async (currentUserId: number, targetUserId: number): Promise<boolean> => {
		if (currentUserId === targetUserId) return true;

		const user = await this.getUserWithRolesAndChildren(currentUserId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) return true;

		// boss — кроме других boss
		if (userRoleAliases.includes(BOSS_ROLE)) {
			const targetIsBoss = await this.isUserBoss(targetUserId);
			return !targetIsBoss;
		}

		// crmAdmin — кроме boss
		if (userRoleAliases.includes(CRM_ADMIN_ROLE)) {
			const targetIsBoss = await this.isUserBoss(targetUserId);
			return !targetIsBoss;
		}

		// Главная роль → дочерняя роль
		const targetUser = await this.user.findUnique({
			where: { id: targetUserId },
			include: { roles: true },
		});
		if (targetUser?.roles) {
			const targetRoleAliases = targetUser.roles.map((r) => r.alias);
			for (const headRole of userRoleAliases) {
				const childRole = ROLE_HIERARCHY[headRole];
				if (childRole && targetRoleAliases.includes(childRole)) {
					return true;
				}
			}
		}

		// Подчинённые (через _user_child)
		if (user.child?.some((child) => child.id === targetUserId)) return true;

		return false;
	};

	/**
	 * Проверка: может ли пользователь редактировать/удалять задачу
	 *
	 * Правила:
	 * 1. Автор — всегда может
	 * 2. admin/developer — полный доступ
	 * 3. boss — всё, кроме задач другого boss
	 * 4. crmAdmin — всё, кроме задач boss
	 * 5. Главная роль — задачи дочерних ролей
	 * 6. Дочерняя роль — задачи подчинённых
	 */
	private canModifyTask = async (userId: number, task: TaskEntity): Promise<boolean> => {
		if (task.authorId === userId) return true;

		// Создал для себя — только автор может редактировать
		if (task.authorId === task.assigneeId) return false;

		const user = await this.getUserWithRolesAndChildren(userId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) return true;

		// boss — кроме задач другого boss
		if (userRoleAliases.includes(BOSS_ROLE)) {
			const authorIsBoss = await this.isUserBoss(task.authorId);
			if (authorIsBoss && task.authorId !== userId) return false;
			const assigneeIsBoss = await this.isUserBoss(task.assigneeId);
			if (assigneeIsBoss && task.assigneeId !== userId) return false;
			return true;
		}

		// crmAdmin — кроме задач boss
		if (userRoleAliases.includes(CRM_ADMIN_ROLE)) {
			const assigneeIsBoss = await this.isUserBoss(task.assigneeId);
			if (assigneeIsBoss) return false;
			return true;
		}

		// Главная роль → задачи дочерних ролей
		const assignee = await this.user.findUnique({
			where: { id: task.assigneeId },
			include: { roles: true },
		});
		if (assignee?.roles) {
			const assigneeRoleAliases = assignee.roles.map((r) => r.alias);
			for (const headRole of userRoleAliases) {
				const childRole = ROLE_HIERARCHY[headRole];
				if (childRole && assigneeRoleAliases.includes(childRole)) {
					return true;
				}
			}
		}

		// Подчинённые (через _user_child)
		if (user.child?.some((child) => child.id === task.assigneeId)) return true;

		return false;
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
			const zonedDeadline = utcToZonedTime(new Date(task.deadline), 'Asia/Tashkent');
			message += `<b>Дедлайн:</b> ${format(zonedDeadline, 'd MMMM yyyy, HH:mm', { locale: ru })}\n`;
		}

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		try {
			const keyboard = Markup.inlineKeyboard([[
				Markup.button.callback('▶️ В работе', `ts:${task.id}:wip`),
				Markup.button.callback('✅ Выполнено', `ts:${task.id}:done`),
			], [
				Markup.button.callback('🔍 Описание', `td:${task.id}:info`),
			]]);
			await this.telegramService.sendMessageWithKeyboard(Number(assignee.telegramId), message, keyboard);
		} catch (error) {
			console.error('Ошибка отправки Telegram уведомления о назначении задачи:', error);
		}
	};

	private sendTaskStatusNotificationToAuthor = async (task: TaskEntity, statusChange: string, changedById: number): Promise<void> => {
		const author = task.author as any;
		if (!author?.telegramId) return;

		const changedBy = await this.user.findUnique({
			where: { id: changedById },
		});

		const organization = task.organization as any;

		let message = `📋 <b>${author?.firstName || ''}</b>, статус вашей задачи изменён!\n\n`;
		message += `<b>Кем:</b> ${changedBy?.firstName || ''} ${changedBy?.lastName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n`;
		message += `<b>${statusChange}</b>\n`;

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		try {
			await this.telegramService.sendMessage(Number(author.telegramId), message);
		} catch (error) {
			console.error('Ошибка отправки уведомления автору о смене статуса задачи:', error);
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
