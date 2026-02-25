import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common';
import { MutationCalendarEventDto } from '../dto/mutation-calendar-event.dto';
import { QueryCalendarEventDto, QueryCalendarEventRangeDto } from '../dto/query-calendar-event.dto';
import { CalendarEventConstants, CalendarEventTypes, CalendarEventStatuses } from '../constants/calendar-event.constants';
import { ROLE_HIERARCHY, CHILD_TO_HEAD, HEAD_ROLES, SUPER_ADMIN_ROLES, BOSS_ROLE, CRM_ADMIN_ROLE } from '../constants/role-hierarchy.constants';
import { CalendarEventNotificationService } from './calendar-event-notification.service';

interface CalendarEventFilter {
	orderBy?: { [key: string]: 'asc' | 'desc' };
	take?: number;
	skip?: number;
}

export interface RangeWithTasksResult {
	events: any[];
	tasks: any[];
}

@Injectable()
export class CalendarEventService extends PrismaService {
	private readonly defaultInclude = {
		author: { include: { roles: true } },
		assignee: { include: { roles: true } },
		organization: true,
		contact: true,
		task: true,
		participants: {
			include: {
				user: true,
			},
		},
	};

	constructor(private readonly notificationService: CalendarEventNotificationService) {
		super();
	}

	create = async ({
		createDto,
		currentUserId,
	}: {
		createDto: MutationCalendarEventDto;
		currentUserId?: number;
	}): Promise<any> => {
		// Валидация типа события
		if (!CalendarEventTypes.includes(createDto.type as any)) {
			throw new HttpException(CalendarEventConstants.VALIDATION_TYPE, HttpStatus.BAD_REQUEST);
		}

		// Валидация дат
		const dateStart = new Date(createDto.dateStart);
		const dateEnd = new Date(createDto.dateEnd);
		if (dateEnd < dateStart) {
			throw new HttpException(CalendarEventConstants.VALIDATION_DATE_RANGE, HttpStatus.BAD_REQUEST);
		}

		// Проверка прав: можно создавать события только себе или подчинённым
		if (currentUserId) {
			const canCreate = await this.canCreateEventForUser(currentUserId, Number(createDto.assigneeId));
			if (!canCreate) {
				throw new HttpException(CalendarEventConstants.FORBIDDEN_CANNOT_CREATE_FOR_USER, HttpStatus.FORBIDDEN);
			}
		}

		const data = {
			type: createDto.type,
			title: createDto.title,
			description: createDto.description || null,
			dateStart,
			dateEnd,
			isAllDay: createDto.isAllDay || false,
			location: createDto.location || null,
			authorId: Number(createDto.authorId),
			assigneeId: Number(createDto.assigneeId),
			organizationId: createDto.organizationId ? Number(createDto.organizationId) : null,
			contactId: createDto.contactId ? Number(createDto.contactId) : null,
			taskId: createDto.taskId ? Number(createDto.taskId) : null,
		};

		const event = await this.calendarEvent.create({
			data,
			include: this.defaultInclude,
		});

		// Отправить уведомление о создании события
		this.notificationService.notifyEventCreated(event).catch(() => {});

		return event;
	};

	findById = async (id: number | string): Promise<any> => {
		return this.calendarEvent.findUnique({
			where: { id: Number(id) },
			include: this.defaultInclude,
		});
	};

	findMany = async ({
		where,
		filter,
	}: {
		where: QueryCalendarEventDto;
		filter?: CalendarEventFilter;
	}): Promise<any[]> => {
		const parsedWhere = this.parseWhere(where);
		return this.calendarEvent.findMany({
			where: parsedWhere,
			include: this.defaultInclude,
			orderBy: filter?.orderBy || { dateStart: 'asc' },
			take: filter?.take,
			skip: filter?.skip,
		});
	};

	/**
	 * Получить события за период для конкретного пользователя
	 * Включает события где пользователь: assignee ИЛИ участник (participant)
	 */
	getByDateRange = async (params: QueryCalendarEventRangeDto, requestingUserId?: number): Promise<any[]> => {
		const from = new Date(params.from);
		const to = new Date(params.to);

		const dateCondition = {
			OR: [
				// Событие начинается в диапазоне
				{ dateStart: { gte: from, lte: to } },
				// Событие заканчивается в диапазоне
				{ dateEnd: { gte: from, lte: to } },
				// Событие охватывает весь диапазон
				{ AND: [{ dateStart: { lte: from } }, { dateEnd: { gte: to } }] },
			],
		};

		let where: any = dateCondition;

		if (params.userId) {
			const userId = Number(params.userId);
			const isViewingOthersCalendar = requestingUserId !== undefined && requestingUserId !== userId;
			const andConditions: any[] = [
				dateCondition,
				{
					OR: [
						{ assigneeId: userId },
						{ participants: { some: { userId: userId } } },
					],
				},
			];

			if (isViewingOthersCalendar) {
				andConditions.push({ type: { not: 'note' } });
			}

			where = { AND: andConditions };
		}

		return this.calendarEvent.findMany({
			where,
			include: this.defaultInclude,
			orderBy: { dateStart: 'asc' },
		});
	};

	/**
	 * Получить события + задачи за период (для страницы календаря)
	 * Включает события где пользователь: assignee ИЛИ участник
	 */
	getRangeWithTasks = async (params: QueryCalendarEventRangeDto, requestingUserId?: number): Promise<RangeWithTasksResult> => {
		const from = new Date(params.from);
		const to = new Date(params.to);

		const dateCondition = {
			OR: [
				{ dateStart: { gte: from, lte: to } },
				{ dateEnd: { gte: from, lte: to } },
				{ AND: [{ dateStart: { lte: from } }, { dateEnd: { gte: to } }] },
			],
		};

		let eventsWhere: any = dateCondition;

		const tasksWhere: any = {
			deadline: { gte: from, lte: to },
			status: { notIn: ['completed', 'cancelled'] },
		};

		if (params.userId) {
			const userId = Number(params.userId);
			const isViewingOthersCalendar = requestingUserId !== undefined && requestingUserId !== userId;
			const andConditions: any[] = [
				dateCondition,
				{
					OR: [
						{ assigneeId: userId },
						{ participants: { some: { userId: userId } } },
					],
				},
			];

			if (isViewingOthersCalendar) {
				andConditions.push({ type: { not: 'note' } });
			}

			eventsWhere = { AND: andConditions };
			tasksWhere.assigneeId = userId;
		}

		const [events, tasks] = await Promise.all([
			this.calendarEvent.findMany({
				where: eventsWhere,
				include: this.defaultInclude,
				orderBy: { dateStart: 'asc' },
			}),
			this.crmTask.findMany({
				where: tasksWhere,
				include: {
					author: { include: { roles: true } },
					assignee: { include: { roles: true } },
					organization: true,
				},
				orderBy: { deadline: 'asc' },
			}),
		]);

		return { events, tasks };
	};

	/**
	 * План на сегодня (для виджета дашборда)
	 */
	getTodayPlan = async (userId: number): Promise<RangeWithTasksResult> => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return this.getRangeWithTasks({
			from: today,
			to: tomorrow,
			userId,
		}, userId);
	};

	getByOrganizationId = async (id: number | string): Promise<any[]> => {
		return this.calendarEvent.findMany({
			where: { organizationId: Number(id) },
			include: this.defaultInclude,
			orderBy: { dateStart: 'desc' },
		});
	};

	getByContactId = async (id: number | string): Promise<any[]> => {
		return this.calendarEvent.findMany({
			where: { contactId: Number(id) },
			include: this.defaultInclude,
			orderBy: { dateStart: 'desc' },
		});
	};

	getByTaskId = async (id: number | string): Promise<any[]> => {
		return this.calendarEvent.findMany({
			where: { taskId: Number(id) },
			include: this.defaultInclude,
			orderBy: { dateStart: 'asc' },
		});
	};

	updateById = async ({
		id,
		updateDto,
		currentUserId,
	}: {
		id: number | string;
		updateDto: Partial<MutationCalendarEventDto>;
		currentUserId?: number;
	}): Promise<any> => {
		const event = await this.findById(id);
		if (!event) throw new HttpException(CalendarEventConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Проверка прав
		if (currentUserId) {
			const canModify = await this.canModifyEvent(currentUserId, event);
			if (!canModify) {
				throw new HttpException(CalendarEventConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		// Валидация типа события
		if (updateDto.type && !CalendarEventTypes.includes(updateDto.type as any)) {
			throw new HttpException(CalendarEventConstants.VALIDATION_TYPE, HttpStatus.BAD_REQUEST);
		}

		const data: any = {};

		if (updateDto.type !== undefined) data.type = updateDto.type;
		if (updateDto.title !== undefined) data.title = updateDto.title;
		if (updateDto.description !== undefined) data.description = updateDto.description;
		if (updateDto.dateStart !== undefined) data.dateStart = new Date(updateDto.dateStart);
		if (updateDto.dateEnd !== undefined) data.dateEnd = new Date(updateDto.dateEnd);
		if (updateDto.isAllDay !== undefined) data.isAllDay = updateDto.isAllDay;
		if (updateDto.location !== undefined) data.location = updateDto.location;
		if (updateDto.assigneeId !== undefined) data.assigneeId = Number(updateDto.assigneeId);
		if (updateDto.organizationId !== undefined) {
			data.organizationId = updateDto.organizationId ? Number(updateDto.organizationId) : null;
		}
		if (updateDto.contactId !== undefined) {
			data.contactId = updateDto.contactId ? Number(updateDto.contactId) : null;
		}
		if (updateDto.taskId !== undefined) {
			data.taskId = updateDto.taskId ? Number(updateDto.taskId) : null;
		}
		if ((updateDto as any).status !== undefined) {
			const newStatus = (updateDto as any).status;
			if (!CalendarEventStatuses.includes(newStatus as any)) {
				throw new HttpException(CalendarEventConstants.VALIDATION_STATUS, HttpStatus.BAD_REQUEST);
			}
			data.status = newStatus;
			if (newStatus === 'completed' || newStatus === 'cancelled') {
				data.completedAt = new Date();
			} else if (newStatus === 'active') {
				data.completedAt = null;
			}
		}

		// Валидация дат после применения изменений
		const finalDateStart = data.dateStart || event.dateStart;
		const finalDateEnd = data.dateEnd || event.dateEnd;
		if (new Date(finalDateEnd) < new Date(finalDateStart)) {
			throw new HttpException(CalendarEventConstants.VALIDATION_DATE_RANGE, HttpStatus.BAD_REQUEST);
		}

		// Определить изменения для уведомления
		const changes: string[] = [];
		if (data.title && data.title !== event.title) changes.push('название');
		if (data.dateStart && data.dateStart.getTime() !== new Date(event.dateStart).getTime()) changes.push('время начала');
		if (data.dateEnd && data.dateEnd.getTime() !== new Date(event.dateEnd).getTime()) changes.push('время окончания');
		if (data.location !== undefined && data.location !== event.location) changes.push('место');
		if (data.description !== undefined && data.description !== event.description) changes.push('описание');

		const updatedEvent = await this.calendarEvent.update({
			where: { id: Number(id) },
			data,
			include: this.defaultInclude,
		});

		// Отправить уведомление об изменении события
		if (changes.length > 0 && currentUserId) {
			this.notificationService.notifyEventUpdated(updatedEvent, changes, currentUserId).catch(() => {});
		}

		return updatedEvent;
	};

	updateStatus = async ({
		id,
		status,
		currentUserId,
	}: {
		id: number | string;
		status: string;
		currentUserId?: number;
	}): Promise<any> => {
		if (!CalendarEventStatuses.includes(status as any)) {
			throw new HttpException(CalendarEventConstants.VALIDATION_STATUS, HttpStatus.BAD_REQUEST);
		}

		const event = await this.findById(id);
		if (!event) throw new HttpException(CalendarEventConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Используем canChangeEventStatus — позволяет исполнителю менять статус
		if (currentUserId) {
			const canChange = await this.canChangeEventStatus(currentUserId, event);
			if (!canChange) {
				throw new HttpException(CalendarEventConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		const data: any = { status };

		if (status === 'completed' || status === 'cancelled') {
			data.completedAt = new Date();
		} else if (status === 'active') {
			data.completedAt = null;
		}

		const updatedEvent = await this.calendarEvent.update({
			where: { id: Number(id) },
			data,
			include: this.defaultInclude,
		});

		// Уведомить автора (руководителя) если статус изменил исполнитель
		if (currentUserId && event.authorId !== currentUserId) {
			const statusLabel = status === 'completed' ? 'выполнено' : status === 'cancelled' ? 'отменено' : 'возвращено в активные';
			this.notificationService.notifyEventStatusChanged(updatedEvent, statusLabel, currentUserId).catch(() => {});
		}

		return updatedEvent;
	};

	deleteById = async (id: number | string, currentUserId?: number): Promise<any> => {
		const event = await this.findById(id);
		if (!event) throw new HttpException(CalendarEventConstants.NOT_FOUND, HttpStatus.NOT_FOUND);

		// Проверка прав
		if (currentUserId) {
			const canModify = await this.canModifyEvent(currentUserId, event);
			if (!canModify) {
				throw new HttpException(CalendarEventConstants.FORBIDDEN_NOT_AUTHOR, HttpStatus.FORBIDDEN);
			}
		}

		// Отправить уведомление об удалении события (до удаления)
		if (currentUserId) {
			this.notificationService.notifyEventDeleted(event, currentUserId).catch(() => {});
		}

		return this.calendarEvent.delete({ where: { id: Number(id) } });
	};

	// ------------------------------
	// Private методы
	// ------------------------------

	private parseWhere = (where: QueryCalendarEventDto): any => {
		const result: any = {};

		if (where.id) result.id = Number(where.id);
		if (where.type) {
			if (Array.isArray(where.type)) {
				result.type = { in: where.type };
			} else {
				result.type = where.type;
			}
		}
		if (where.title) result.title = { contains: where.title, mode: 'insensitive' };
		if (where.authorId) result.authorId = Number(where.authorId);
		if (where.assigneeId) result.assigneeId = Number(where.assigneeId);
		if (where.organizationId) result.organizationId = Number(where.organizationId);
		if (where.contactId) result.contactId = Number(where.contactId);
		if (where.taskId) result.taskId = Number(where.taskId);
		if (where.status) {
			if (Array.isArray(where.status)) {
				result.status = { in: where.status };
			} else {
				result.status = where.status;
			}
		}
		if (where.isAllDay !== undefined) result.isAllDay = where.isAllDay;
		if (where.participantUserId) result.participants = { some: { userId: Number(where.participantUserId) } };

		return result;
	};

	/**
	 * Получить роли пользователя (кэш на уровне запроса)
	 */
	private getUserWithRolesAndChildren = async (userId: number) => {
		return this.user.findUnique({
			where: { id: userId },
			include: { roles: true, child: true },
		});
	};

	/**
	 * Проверить, является ли targetUser "Boss" (имеет роль boss)
	 */
	private isUserBoss = async (userId: number): Promise<boolean> => {
		const user = await this.user.findUnique({
			where: { id: userId },
			include: { roles: true },
		});
		return user?.roles?.some((role) => role.alias === BOSS_ROLE) || false;
	};

	/**
	 * Проверка: может ли пользователь создавать события для другого пользователя
	 *
	 * Правила:
	 * 1. Себе — всегда можно
	 * 2. admin/developer — всем
	 * 3. boss — всем, кроме других boss
	 * 4. crmAdmin — всем, кроме boss
	 * 5. Главная роль (head) — дочерним ролям (child) своего отдела
	 * 6. Дочерняя роль — своим подчинённым (через _user_child)
	 */
	private canCreateEventForUser = async (currentUserId: number, targetUserId: number): Promise<boolean> => {
		// Себе всегда можно
		if (currentUserId === targetUserId) return true;

		const user = await this.getUserWithRolesAndChildren(currentUserId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer — полный доступ
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) {
			return true;
		}

		// boss — доступ ко всем, кроме других boss
		if (userRoleAliases.includes(BOSS_ROLE)) {
			const targetIsBoss = await this.isUserBoss(targetUserId);
			return !targetIsBoss;
		}

		// crmAdmin — доступ ко всем, кроме boss
		if (userRoleAliases.includes(CRM_ADMIN_ROLE)) {
			const targetIsBoss = await this.isUserBoss(targetUserId);
			return !targetIsBoss;
		}

		// Главная роль → может создавать для сотрудников с дочерней ролью
		const targetUser = await this.user.findUnique({
			where: { id: targetUserId },
			include: { roles: true },
		});
		if (!targetUser?.roles) return false;

		const targetRoleAliases = targetUser.roles.map((r) => r.alias);

		for (const headRole of userRoleAliases) {
			const childRole = ROLE_HIERARCHY[headRole];
			if (childRole && targetRoleAliases.includes(childRole)) {
				return true;
			}
		}

		// Дочерняя роль → может создавать для своих подчинённых (через _user_child)
		if (user.child?.some((child) => child.id === targetUserId)) {
			return true;
		}

		return false;
	};

	/**
	 * Проверка: может ли пользователь редактировать/удалять событие
	 *
	 * Правила:
	 * 1. Автор — всегда может (это его событие)
	 * 2. admin/developer — полный доступ
	 * 3. boss — всё, кроме событий другого boss
	 * 4. crmAdmin — всё, кроме событий boss
	 * 5. Главная роль — события дочерних ролей в своём отделе
	 * 6. Дочерняя роль — события своих подчинённых (через _user_child)
	 *    НО: дочерняя роль НЕ может редактировать/удалять событие, созданное главной ролью
	 */
	private canModifyEvent = async (userId: number, event: any): Promise<boolean> => {
		// Автор всегда может
		if (event.authorId === userId) return true;

		// Создал для себя — только автор может редактировать
		if (event.authorId === event.assigneeId) return false;

		const user = await this.getUserWithRolesAndChildren(userId);
		if (!user?.roles) return false;

		const userRoleAliases = user.roles.map((r) => r.alias);

		// admin/developer — полный доступ
		if (userRoleAliases.some((alias) => SUPER_ADMIN_ROLES.includes(alias))) {
			return true;
		}

		// boss — всё, кроме событий другого boss
		if (userRoleAliases.includes(BOSS_ROLE)) {
			// Проверить, является ли автор события boss
			const authorIsBoss = await this.isUserBoss(event.authorId);
			if (authorIsBoss && event.authorId !== userId) return false;
			// Проверить, является ли исполнитель boss (защита от редактирования событий для boss-ов)
			const assigneeIsBoss = await this.isUserBoss(event.assigneeId);
			if (assigneeIsBoss && event.assigneeId !== userId) return false;
			return true;
		}

		// crmAdmin — всё, кроме событий boss
		if (userRoleAliases.includes(CRM_ADMIN_ROLE)) {
			const assigneeIsBoss = await this.isUserBoss(event.assigneeId);
			if (assigneeIsBoss) return false;
			return true;
		}

		// Главная роль → события сотрудников с дочерней ролью
		const assignee = await this.user.findUnique({
			where: { id: event.assigneeId },
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

		// Дочерняя роль → события подчинённых (через _user_child)
		// НО: нельзя модифицировать событие, созданное главной ролью
		if (user.child?.some((child) => child.id === event.assigneeId)) {
			return true;
		}

		return false;
	};

	/**
	 * Проверка: может ли пользователь менять статус события (Готово/Отмена)
	 * Расширенная версия canModifyEvent — позволяет дочерней роли менять статус
	 * даже на событиях, созданных главной ролью
	 */
	private canChangeEventStatus = async (userId: number, event: any): Promise<boolean> => {
		// Автор всегда может
		if (event.authorId === userId) return true;

		// Исполнитель может менять статус (даже если событие от руководителя)
		if (event.assigneeId === userId) return true;

		// В остальном — те же правила что и canModifyEvent
		return this.canModifyEvent(userId, event);
	};
}
