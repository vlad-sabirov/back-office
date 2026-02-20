import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority, CrmTaskConst } from '@fsd/entities/crm-task';
import { TaskDetailModal } from '@fsd/features/crm-task-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-tasks-modal.module.scss';

interface IProps {
	tasks: ICrmTaskEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
	onReload?: () => void;
	completedOnly?: boolean;
}

export const StaffTasksModal: FC<IProps> = ({ tasks, opened, onClose, userName, onReload, completedOnly }) => {
	const [viewingTask, setViewingTask] = useState<ICrmTaskEntity | null>(null);

	const sortedTasks = useMemo(() => {
		if (completedOnly) {
			// Выполненные задачи — сортируем по дате обновления (новые первые)
			return tasks
				.filter((t) => t.status === EnCrmTaskStatus.Completed)
				.sort((a, b) => {
					const aDate = a.completedAt || a.updatedAt;
					const bDate = b.completedAt || b.updatedAt;
					return new Date(bDate).getTime() - new Date(aDate).getTime();
				});
		}

		// Активные задачи — сначала просроченные, потом по дедлайну
		const activeTasks = tasks.filter(
			(t) => t.status === EnCrmTaskStatus.Pending || t.status === EnCrmTaskStatus.InProgress
		);

		return activeTasks.sort((a, b) => {
			const aOverdue = a.deadline ? isPast(parseISO(a.deadline)) : false;
			const bOverdue = b.deadline ? isPast(parseISO(b.deadline)) : false;

			if (aOverdue && !bOverdue) return -1;
			if (!aOverdue && bOverdue) return 1;

			if (a.deadline && b.deadline) {
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
			}
			if (a.deadline && !b.deadline) return -1;
			if (!a.deadline && b.deadline) return 1;

			return 0;
		});
	}, [tasks, completedOnly]);

	const handleTaskClick = useCallback((task: ICrmTaskEntity) => {
		setViewingTask(task);
	}, []);

	const handleDetailClose = useCallback(() => {
		setViewingTask(null);
	}, []);

	const handleUpdated = useCallback(() => {
		setViewingTask(null);
		onReload?.();
	}, [onReload]);

	const handleDeleted = useCallback(() => {
		setViewingTask(null);
		onReload?.();
	}, [onReload]);

	return (
		<>
			<Modal
				opened={opened}
				onClose={onClose}
				title={completedOnly ? `Выполненные задачи: ${userName || 'сотрудника'}` : `Задачи: ${userName || 'сотрудника'}`}
				size={700}
			>
				<div className={css.tasksList}>
					{sortedTasks.length === 0 ? (
						<TextField className={css.empty}>
							{completedOnly ? 'Нет выполненных задач' : 'Нет активных задач'}
						</TextField>
					) : (
						sortedTasks.map((task) => (
							<TaskItem key={task.id} task={task} onClick={handleTaskClick} />
						))
					)}
				</div>
			</Modal>

			<TaskDetailModal
				task={viewingTask}
				opened={!!viewingTask}
				onClose={handleDetailClose}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
			/>
		</>
	);
};

interface ITaskItemProps {
	task: ICrmTaskEntity;
	onClick: (task: ICrmTaskEntity) => void;
}

const TaskItem: FC<ITaskItemProps> = ({ task, onClick }) => {
	const isCompleted = task.status === EnCrmTaskStatus.Completed;

	const isOverdue = useMemo(() => {
		if (isCompleted || !task.deadline) return false;
		return isPast(parseISO(task.deadline));
	}, [task.deadline, isCompleted]);

	const deadlineDate = useMemo(() => {
		if (!task.deadline) return null;
		return format(parseISO(task.deadline), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [task.deadline]);

	const completedDate = useMemo(() => {
		if (!isCompleted) return null;
		const date = task.completedAt || task.updatedAt;
		return format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [task.completedAt, task.updatedAt, isCompleted]);

	const priorityConfig = CrmTaskConst.Priority[task.priority as EnCrmTaskPriority]
		|| { label: task.priority, color: 'gray' };

	const org = task.organization as any;
	const organizationName = org?.nameRu || org?.nameEn || 'Без организации';

	const author = task.author;
	const authorName = author ? `${author.lastName || ''} ${author.firstName || ''}`.trim() : 'Неизвестно';

	const itemClass = `${css.taskItem} ${isOverdue ? css.taskItemOverdue : ''} ${isCompleted ? css.taskItemCompleted : ''}`;

	return (
		<div className={itemClass} onClick={() => onClick(task)}>
			<div className={css.taskContent}>
				<div className={css.taskHeader}>
					<span className={`${css.priorityDot} ${css[`priority_${priorityConfig.color}`]}`} />
					<TextField className={css.taskTitle}>{task.title}</TextField>
					{isOverdue && <span className={css.overdueLabel}>Просрочено</span>}
					{isCompleted && <span className={css.completedLabel}>Выполнено</span>}
				</div>
				<div className={css.taskMeta}>
					<div className={css.organization}>
						<Icon name="crm" className={css.orgIcon} />
						<span>{organizationName}</span>
					</div>
					{completedDate && (
						<div className={css.completedDate}>
							<Icon name="calendar" className={css.calendarIcon} />
							<span>{completedDate}</span>
						</div>
					)}
					{!isCompleted && deadlineDate && (
						<div className={`${css.deadline} ${isOverdue ? css.deadlineOverdue : ''}`}>
							<Icon name="calendar" className={css.calendarIcon} />
							<span>{deadlineDate}</span>
						</div>
					)}
					<div className={css.author}>
						<Icon name="user" className={css.authorIcon} />
						<span>{authorName}</span>
					</div>
				</div>
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};
