import { FC, useMemo } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority, CrmTaskConst } from '@fsd/entities/crm-task';
import { StaffAvatar } from '@fsd/entities/staff';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { TextField, Icon } from '@fsd/shared/ui-kit';
import css from './task.module.scss';

interface IProps {
	task: ICrmTaskEntity;
	className?: string;
}

export const Task: FC<IProps> = ({ task, className }) => {
	const author = useMemo(() => task.author, [task.author]);
	const assignee = useMemo(() => task.assignee, [task.assignee]);

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
			</div>

			<div className={css.taskContent}>
				<TextField className={css.taskTitle}>{task.title}</TextField>

				{task.description && (
					<TextField className={css.taskDescription}>{task.description}</TextField>
				)}

				<div className={css.taskMeta}>
					<span className={`${css.badge} ${css[`badge_${statusConfig.color}`]}`}>
						{statusConfig.label}
					</span>
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
			</div>
		</div>
	);
};
