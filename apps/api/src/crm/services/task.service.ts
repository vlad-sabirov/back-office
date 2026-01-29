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
	constructor(private readonly telegramService: TelegramService) {
		super();
	}

	create = async ({ createDto }: { createDto: MutationTaskDto }): Promise<TaskEntity> => {
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
			include: include || { author: true, assignee: true, organization: true },
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
			include: include || { author: true, assignee: true, organization: true },
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
			include: include || { author: true, assignee: true, organization: true },
			orderBy: filter?.orderBy || { createdAt: 'desc' },
			take: filter?.take,
			skip: filter?.skip,
		});
	};

	getByOrganizationId = async (id: number | string): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: { organizationId: Number(id) },
			include: { author: true, assignee: true, organization: true },
			orderBy: { createdAt: 'desc' },
		});
	};

	getByAssigneeId = async (id: number | string): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: { assigneeId: Number(id) },
			include: { author: true, assignee: true, organization: true },
			orderBy: { createdAt: 'desc' },
		});
	};

	getMyTasks = async (userId: number): Promise<TaskEntity[]> => {
		return this.crmTask.findMany({
			where: {
				OR: [{ assigneeId: userId }, { authorId: userId }],
			},
			include: { author: true, assignee: true, organization: true },
			orderBy: { createdAt: 'desc' },
		});
	};

	updateById = async ({
		id,
		updateDto,
	}: {
		id: number | string;
		updateDto: Partial<MutationTaskDto>;
	}): Promise<TaskEntity> => {
		await this.throwNotFoundError(id);

		const data: any = {};
		if (updateDto.title !== undefined) data.title = updateDto.title;
		if (updateDto.description !== undefined) data.description = updateDto.description;
		if (updateDto.status !== undefined) data.status = updateDto.status;
		if (updateDto.priority !== undefined) data.priority = updateDto.priority;
		if (updateDto.deadline !== undefined) data.deadline = updateDto.deadline ? new Date(updateDto.deadline) : null;
		if (updateDto.assigneeId !== undefined) data.assigneeId = Number(updateDto.assigneeId);
		if (updateDto.organizationId !== undefined)
			data.organizationId = updateDto.organizationId ? Number(updateDto.organizationId) : null;

		return this.crmTask.update({
			where: { id: Number(id) },
			data,
			include: { author: true, assignee: true, organization: true },
		});
	};

	updateStatus = async (id: number | string, status: string): Promise<TaskEntity> => {
		await this.throwNotFoundError(id);

		const data: any = { status };
		if (status === 'completed') {
			data.completedAt = new Date();
		}

		return this.crmTask.update({
			where: { id: Number(id) },
			data,
			include: { author: true, assignee: true, organization: true },
		});
	};

	deleteById = async (id: number | string): Promise<TaskEntity> => {
		await this.throwNotFoundError(id);
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

	private sendTaskAssignedNotification = async (task: TaskEntity): Promise<void> => {
		const assignee = task.assignee as any;
		if (!assignee?.telegramId) return;

		const author = task.author as any;
		const organization = task.organization as any;

		let message = `📌 <b>Вам назначена новая задача</b>\n\n`;
		message += `<b>От:</b> ${author?.lastName || ''} ${author?.firstName || ''}\n`;
		message += `<b>Задача:</b> ${task.title}\n`;

		if (task.deadline) {
			message += `<b>Дедлайн:</b> ${format(new Date(task.deadline), 'd MMMM yyyy', { locale: ru })}\n`;
		}

		if (task.priority === 'urgent') {
			message += `⚡ <b>СРОЧНО!</b>\n`;
		}

		if (organization) {
			message += `<b>Организация:</b> ${organization.nameRu || organization.nameEn || ''}\n`;
		}

		try {
			await this.telegramService.sendMessage(Number(assignee.telegramId), message);
		} catch (error) {
			console.error('Failed to send Telegram notification:', error);
		}
	};
}
