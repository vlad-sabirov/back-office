import { FC, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO, isPast } from 'date-fns';
import { ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority, CrmTaskConst } from '@fsd/entities/crm-task';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-tasks-modal.module.scss';

interface IProps {
	tasks: ICrmTaskEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
}

export const StaffTasksModal: FC<IProps> = ({ tasks, opened, onClose, userName }) => {
	// Сортируем задачи: сначала просроченные, потом по дедлайну
	const sortedTasks = useMemo(() => {
		const activeTasks = tasks.filter(
			(t) => t.status === EnCrmTaskStatus.Pending || t.status === EnCrmTaskStatus.InProgress
		);

		return activeTasks.sort((a, b) => {
			const aOverdue = a.deadline ? isPast(parseISO(a.deadline)) : false;
			const bOverdue = b.deadline ? isPast(parseISO(b.deadline)) : false;

			// Просроченные в начале
			if (aOverdue && !bOverdue) return -1;
			if (!aOverdue && bOverdue) return 1;

			// Потом по дедлайну
			if (a.deadline && b.deadline) {
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
			}
			if (a.deadline && !b.deadline) return -1;
			if (!a.deadline && b.deadline) return 1;

			return 0;
		});
	}, [tasks]);

	return (
		<Modal opened={opened} onClose={onClose} title={`Задачи: ${userName || 'сотрудника'}`} size={700}>
			<div className={css.tasksList}>
				{sortedTasks.length === 0 ? (
					<TextField className={css.empty}>Нет активных задач</TextField>
				) : (
					sortedTasks.map((task) => (
						<TaskItem key={task.id} task={task} />
					))
				)}
			</div>
		</Modal>
	);
};

interface ITaskItemProps {
	task: ICrmTaskEntity;
}

const TaskItem: FC<ITaskItemProps> = ({ task }) => {
	const isOverdue = useMemo(() => {
		if (!task.deadline) return false;
		return isPast(parseISO(task.deadline));
	}, [task.deadline]);

	const deadlineDate = useMemo(() => {
		if (!task.deadline) return null;
		return format(parseISO(task.deadline), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [task.deadline]);

	const priorityConfig = CrmTaskConst.Priority[task.priority as EnCrmTaskPriority]
		|| { label: task.priority, color: 'gray' };

	// Название организации (nameRu или nameEn)
	const org = task.organization as any;
	const organizationName = org?.nameRu || org?.nameEn || 'Без организации';
	const organizationId = task.organizationId;

	// Автор задачи
	const author = task.author;
	const authorName = author ? `${author.lastName || ''} ${author.firstName || ''}`.trim() : 'Неизвестно';

	const itemClass = `${css.taskItem} ${isOverdue ? css.taskItemOverdue : ''}`;

	const content = (
		<div className={css.taskContent}>
			<div className={css.taskHeader}>
				<span className={`${css.priorityDot} ${css[`priority_${priorityConfig.color}`]}`} />
				<TextField className={css.taskTitle}>{task.title}</TextField>
				{isOverdue && <span className={css.overdueLabel}>Просрочено</span>}
			</div>
			<div className={css.taskMeta}>
				<div className={css.organization}>
					<Icon name="crm" className={css.orgIcon} />
					<span>{organizationName}</span>
				</div>
				{deadlineDate && (
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
	);

	if (organizationId) {
		return (
			<Link href={`/crm/organization/${organizationId}`}>
				<a className={itemClass}>
					{content}
					<Icon name="arrow-medium" className={css.arrowIcon} />
				</a>
			</Link>
		);
	}

	return <div className={itemClass}>{content}</div>;
};
