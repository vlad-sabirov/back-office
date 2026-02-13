import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO, isPast, formatDistanceToNow } from 'date-fns';
import { ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority, CrmTaskConst, CrmTaskService } from '@fsd/entities/crm-task';
import { StaffAvatar } from '@fsd/entities/staff';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField, Icon, Select } from '@fsd/shared/ui-kit';
import { ActionIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TaskEditModal } from './TaskEditModal';
import { TaskDeleteModal } from './TaskDeleteModal';
import css from './task.module.scss';

const statusOptions = [
	{ value: EnCrmTaskStatus.Pending, label: 'Ожидает' },
	{ value: EnCrmTaskStatus.InProgress, label: 'В работе' },
	{ value: EnCrmTaskStatus.Completed, label: 'Выполнена' },
	{ value: EnCrmTaskStatus.Cancelled, label: 'Отменена' },
];

interface IProps {
	task: ICrmTaskEntity;
	className?: string;
}

export const Task: FC<IProps> = ({ task, className }) => {
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [deleteModalOpened, setDeleteModalOpened] = useState(false);

	// Получаем текущего пользователя и его роли
	const currentUserId = useStateSelector((state) => state.app.auth.userId);
	const currentUserRoles = useStateSelector((state) => state.app.auth.roles) || [];

	const author = useMemo(() => task.author, [task.author]);
	const assignee = useMemo(() => task.assignee, [task.assignee]);

	const historyActions = useCrmHistoryActions();
	const [updateTaskStatus] = CrmTaskService.updateStatus();

	// Проверка прав на редактирование/удаление
	// Можно если: ты автор ИЛИ имеешь роль boss/admin/developer/crmAdmin
	const canModify = useMemo(() => {
		const isAuthor = task.authorId === Number(currentUserId);
		const hasAdminRole = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);
		return isAuthor || hasAdminRole;
	}, [task.authorId, currentUserId, currentUserRoles]);

	// Исполнитель тоже может менять статус
	const canChangeStatus = useMemo(() => {
		const isAssignee = task.assigneeId === Number(currentUserId);
		return canModify || isAssignee;
	}, [canModify, task.assigneeId, currentUserId]);

	const handleStatusChange = useCallback(async (newStatus: string) => {
		try {
			await updateTaskStatus({ id: task.id, status: newStatus }).unwrap();
			showNotification({ color: 'green', message: 'Статус задачи обновлён' });
			historyActions.reloadTimestamp();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при смене статуса';
			showNotification({ color: 'red', message });
		}
	}, [task.id, updateTaskStatus, historyActions]);

	const openEditModal = useCallback(() => setEditModalOpened(true), []);
	const closeEditModal = useCallback(() => setEditModalOpened(false), []);
	const openDeleteModal = useCallback(() => setDeleteModalOpened(true), []);
	const closeDeleteModal = useCallback(() => setDeleteModalOpened(false), []);

	const createdDate = useMemo(() => {
		return format(parseISO(task.createdAt), 'dd MMMM yyyy', { locale: dateFnsLocaleRu });
	}, [task.createdAt]);

	const deadlineDate = useMemo(() => {
		if (!task.deadline) return null;
		return format(parseISO(task.deadline), 'dd MMMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [task.deadline]);

	const isOverdue = useMemo(() => {
		if (!task.deadline) return false;
		return isPast(parseISO(task.deadline)) && task.status !== EnCrmTaskStatus.Completed;
	}, [task.deadline, task.status]);

	const statusConfig = CrmTaskConst.Status[task.status as EnCrmTaskStatus]
		|| { label: task.status, color: 'gray' };
	const priorityConfig = CrmTaskConst.Priority[task.priority as EnCrmTaskPriority]
		|| { label: task.priority, color: 'gray' };

	const isUrgent = task.priority === EnCrmTaskPriority.Urgent || task.priority === EnCrmTaskPriority.High;

	if (!author) {
		return null;
	}

	const wrapperClass = `${className} ${css.taskWrapper} ${isOverdue ? css.overdue : ''} ${isUrgent ? css.urgent : ''}`;

	return (
		<div className={wrapperClass}>
			<StaffAvatar user={author} size={'small'} className={css.avatar} />

			<TextField className={css.date} size={'small'}>
				{createdDate}
			</TextField>

			<div className={css.taskHeader}>
				<Icon name="todo" className={css.taskIcon} />
				<TextField size={'small'} className={css.label}>
					Создал{author.sex === 'female' && 'а'} задачу
				</TextField>
				{canModify && (
					<div className={css.actions}>
						<ActionIcon size="sm" variant="subtle" onClick={openEditModal} title="Редактировать">
							<Icon name="edit" className={css.actionIcon} />
						</ActionIcon>
						<ActionIcon size="sm" variant="subtle" color="red" onClick={openDeleteModal} title="Удалить">
							<Icon name="trash" className={css.actionIcon} />
						</ActionIcon>
					</div>
				)}
			</div>

			<div className={css.taskContent}>
				<TextField className={css.taskTitle}>{task.title}</TextField>

				{task.description && (
					<TextField className={css.taskDescription}>{task.description}</TextField>
				)}

				<div className={css.taskMeta}>
					{canChangeStatus ? (
						<Select
							data={statusOptions}
							value={task.status}
							onChange={(value) => value && handleStatusChange(value)}
							size="medium"
							className={css.statusSelectWrapper}
						/>
					) : (
						<span className={`${css.badge} ${css[`badge_${statusConfig.color}`]}`}>
							{statusConfig.label}
						</span>
					)}
					<span className={`${css.badge} ${css[`badge_${priorityConfig.color}`]}`}>
						{priorityConfig.label}
					</span>
					{deadlineDate && (
						<span className={`${css.deadline} ${isOverdue ? css.deadlineOverdue : ''}`}>
							Дедлайн: {deadlineDate}
						</span>
					)}
				</div>

				{assignee && assignee.id !== author?.id && (
					<div className={css.assignee}>
						<TextField size={'small'} className={css.assigneeLabel}>
							Исполнитель: {assignee.lastName} {assignee.firstName}
						</TextField>
					</div>
				)}

				{task.modifications && task.modifications.length > 0 && (
					<div className={css.modifications}>
						{task.modifications.slice(0, 2).map((mod) => {
							const modifiedBy = mod.modifiedBy;
							const modDate = formatDistanceToNow(parseISO(mod.createdAt), {
								addSuffix: true,
								locale: dateFnsLocaleRu,
							});
							return (
								<div key={mod.id} className={css.modificationItem}>
									<span className={css.modificationLabel}>Изменено:</span>
									{' '}
									<span className={css.modificationAuthor}>
										{modifiedBy?.lastName || ''} {modifiedBy?.firstName || ''}
									</span>
									{' '}
									<span className={css.modificationDate}>{modDate}</span>
								</div>
							);
						})}
					</div>
				)}
			</div>

			<TaskEditModal task={task} opened={editModalOpened} onClose={closeEditModal} />
			<TaskDeleteModal task={task} opened={deleteModalOpened} onClose={closeDeleteModal} />
		</div>
	);
};
