import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO, isPast, formatDistanceToNow } from 'date-fns';
import { ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority, CrmTaskConst, CrmTaskService } from '@fsd/entities/crm-task';
import { StaffAvatar } from '@fsd/entities/staff';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { ROLE_HIERARCHY } from '@fsd/shared/lib/role-hierarchy';
import { TextField, Icon, Select } from '@fsd/shared/ui-kit';
import { ActionIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TaskDetailModal } from '@fsd/features/crm-task-detail-modal';
import css from './task.module.scss';

const allStatusOptions = [
	{ value: EnCrmTaskStatus.Pending, label: 'Ожидает' },
	{ value: EnCrmTaskStatus.InProgress, label: 'В работе' },
	{ value: EnCrmTaskStatus.Completed, label: 'Выполнена' },
	{ value: EnCrmTaskStatus.Cancelled, label: 'Отменена' },
];

const assigneeAllowedStatuses = [
	{ value: EnCrmTaskStatus.InProgress, label: 'В работе' },
	{ value: EnCrmTaskStatus.Completed, label: 'Выполнена' },
];

// Текущий статус всегда должен быть виден + доступные для смены
const getAssigneeStatusOptions = (currentStatus: string) => {
	const allowed = [...assigneeAllowedStatuses];
	// Если текущий статус — ожидает/отменена, добавить его в список (disabled) чтобы было видно
	if (currentStatus === EnCrmTaskStatus.Pending || currentStatus === EnCrmTaskStatus.Cancelled) {
		const currentOption = allStatusOptions.find((o) => o.value === currentStatus);
		if (currentOption) {
			allowed.unshift({ ...currentOption, disabled: true } as any);
		}
	}
	return allowed;
};

interface IProps {
	task: ICrmTaskEntity;
	className?: string;
}

export const Task: FC<IProps> = ({ task, className }) => {
	const [detailModalOpened, setDetailModalOpened] = useState(false);
	const [openInEditMode, setOpenInEditMode] = useState(false);

	const currentUserId = useStateSelector((state) => state.app.auth.userId);
	const currentUserRoles = useStateSelector((state) => state.app.auth.roles) || [];

	const author = useMemo(() => task.author, [task.author]);
	const assignee = useMemo(() => task.assignee, [task.assignee]);

	const historyActions = useCrmHistoryActions();
	const [updateTaskStatus] = CrmTaskService.updateStatus();

	const canEditAndDelete = useMemo(() => {
		// Если задача отменена или выполнена — редактирование закрыто для всех
		if (task.status === EnCrmTaskStatus.Cancelled || task.status === EnCrmTaskStatus.Completed) {
			return false;
		}
		const isAuthor = task.authorId === Number(currentUserId);
		const isAssignee = task.assigneeId === Number(currentUserId);
		// Создал для себя — только автор может редактировать
		if (task.authorId === task.assigneeId) return isAuthor;
		const isBoss = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);
		const assigneeRoles = (task.assignee?.roles as any[] || []).map((r: any) => r.alias || r);
		const isHeadForAssignee = currentUserRoles.some((role: string) => {
			const childRole = ROLE_HIERARCHY[role];
			return childRole && assigneeRoles.includes(childRole);
		});
		const authorRoles = (task.author?.roles as any[] || []).map((r: any) => r.alias || r);
		const isCreatedByHead = authorRoles.some((r: string) => Object.keys(ROLE_HIERARCHY).includes(r));
		const canModify = isAuthor || isBoss || isHeadForAssignee;
		return canModify && !(isAssignee && !isAuthor && isCreatedByHead && !isBoss && !isHeadForAssignee);
	}, [task, currentUserId, currentUserRoles]);

	const canChangeStatus = useMemo(() => {
		const isAuthor = task.authorId === Number(currentUserId);
		const isAssignee = task.assigneeId === Number(currentUserId);
		const isBoss = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);

		// Если задача отменена или выполнена — менять статус может только руководитель
		if (task.status === EnCrmTaskStatus.Cancelled || task.status === EnCrmTaskStatus.Completed) {
			const isSuperAdmin = currentUserRoles.some((role: string) =>
				['boss', 'admin', 'developer'].includes(role)
			);
			const assigneeRoles = (task.assignee?.roles as any[] || []).map((r: any) => r.alias || r);
			const isHeadForAssignee = currentUserRoles.some((role: string) => {
				const childRole = ROLE_HIERARCHY[role];
				return childRole && assigneeRoles.includes(childRole);
			});
			return isAuthor || isSuperAdmin || isHeadForAssignee;
		}

		return isAuthor || isAssignee || isBoss;
	}, [task.authorId, task.assigneeId, task.status, task.assignee, currentUserId, currentUserRoles]);

	// Подчинённый (исполнитель, но не автор, не boss/admin и не руководитель) видит только "В работе" и "Выполнена"
	// Но текущий статус задачи всегда отображается (даже если это "ожидает" или "отменена")
	const statusOptions = useMemo(() => {
		const isAuthor = task.authorId === Number(currentUserId);
		const isSuperAdmin = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer'].includes(role)
		);
		const assigneeRoles = (task.assignee?.roles as any[] || []).map((r: any) => r.alias || r);
		const isHeadForAssignee = currentUserRoles.some((role: string) => {
			const childRole = ROLE_HIERARCHY[role];
			return childRole && assigneeRoles.includes(childRole);
		});
		if (isAuthor || isSuperAdmin || isHeadForAssignee) return allStatusOptions;
		return getAssigneeStatusOptions(task.status);
	}, [task.authorId, task.assignee, task.status, currentUserId, currentUserRoles]);

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

	const openDetailModal = useCallback(() => {
		setOpenInEditMode(false);
		setDetailModalOpened(true);
	}, []);
	const openEditModal = useCallback(() => {
		setOpenInEditMode(true);
		setDetailModalOpened(true);
	}, []);
	const closeDetailModal = useCallback(() => {
		setDetailModalOpened(false);
		setOpenInEditMode(false);
	}, []);

	const handleUpdated = useCallback(() => {
		historyActions.reloadTimestamp();
	}, [historyActions]);

	const handleDeleted = useCallback(() => {
		historyActions.reloadTimestamp();
	}, [historyActions]);

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
				<div className={css.actions}>
					<ActionIcon size="sm" variant="subtle" onClick={openDetailModal} title="Подробнее">
						<Icon name="eye" className={css.actionIcon} />
					</ActionIcon>
					{canEditAndDelete && (
						<ActionIcon size="sm" variant="subtle" onClick={openEditModal} title="Редактировать">
							<Icon name="edit" className={css.actionIcon} />
						</ActionIcon>
					)}
				</div>
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

			<TaskDetailModal
				task={detailModalOpened ? task : null}
				opened={detailModalOpened}
				onClose={closeDetailModal}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
				defaultEditing={openInEditMode}
			/>
		</div>
	);
};
