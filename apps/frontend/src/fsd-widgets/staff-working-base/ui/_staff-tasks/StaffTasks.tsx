import { FC, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { CrmTaskService, ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import css from './staff-tasks.module.scss';

export const StaffTasks: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();
	const [tasks, setTasks] = useState<ICrmTaskEntity[]>([]);

	const [fetchTasks] = CrmTaskService.getByAssigneeId();

	// Загрузка задач при изменении пользователя
	useEffect(() => {
		if (user?.id) {
			fetchTasks(user.id).then(({ data }) => {
				if (data) {
					setTasks(data);
				}
			});
		}
	}, [user?.id, fetchTasks]);

	// Подсчет задач по приоритетам (только активные - pending и in_progress)
	const taskStats = useMemo(() => {
		const activeTasks = tasks.filter(
			(t) => t.status === EnCrmTaskStatus.Pending || t.status === EnCrmTaskStatus.InProgress
		);

		return {
			total: activeTasks.length,
			urgent: activeTasks.filter((t) => t.priority === EnCrmTaskPriority.Urgent).length,
			high: activeTasks.filter((t) => t.priority === EnCrmTaskPriority.High).length,
			normal: activeTasks.filter((t) => t.priority === EnCrmTaskPriority.Normal).length,
			low: activeTasks.filter((t) => t.priority === EnCrmTaskPriority.Low).length,
			completed: tasks.filter((t) => t.status === EnCrmTaskStatus.Completed).length,
			overdue: activeTasks.filter((t) => {
				if (!t.deadline) return false;
				return new Date(t.deadline) < new Date();
			}).length,
		};
	}, [tasks]);

	// Показывать только если есть задачи или это текущий пользователь
	const isDisplay = user?.id && (taskStats.total > 0 || userId === user.id);

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 1250) setSpanCount(100);
		if (screenWidth >= 1250 && screenWidth <= 1350) setSpanCount(65);
		if (screenWidth >= 1350 && screenWidth <= 1400) setSpanCount(60);
		if (screenWidth >= 1400 && screenWidth <= 1450) setSpanCount(55);
		if (screenWidth >= 1450 && screenWidth <= 1550) setSpanCount(50);
		if (screenWidth >= 1550 && screenWidth <= 1650) setSpanCount(45);
		if (screenWidth >= 1650 && screenWidth <= 1800) setSpanCount(40);
		if (screenWidth >= 1800 && screenWidth <= 1950) setSpanCount(35);
		if (screenWidth >= 1950 && screenWidth <= 2200) setSpanCount(30);
		if (screenWidth >= 2200 && screenWidth <= 2400) setSpanCount(25);
		if (screenWidth >= 2400 && screenWidth <= 2550) setSpanCount(25);
		if (screenWidth >= 2550 && screenWidth <= 2900) setSpanCount(20);
		if (screenWidth >= 2900 && screenWidth <= 3300) setSpanCount(17);
		if (screenWidth >= 3300 && screenWidth <= 3600) setSpanCount(15);
	}, [screenWidth]);

	if (!isDisplay) {
		return null;
	}

	return (
		<Grid.Col span={spanCount}>
			<ContentBlock className={css.root}>
				<TextField mode={'heading'} size={'small'}>
					<Icon name={'todo'} className={css.headerIcon} />
					Задачи сотрудника
				</TextField>

				<TextField className={css.tasksAll} size={'large'}>
					Активных задач:
					<span className={taskStats.total > 0 ? css.hasValue : ''}>{taskStats.total}</span>
				</TextField>

				{taskStats.overdue > 0 && (
					<TextField className={css.taskRow}>
						<span className={css.iconOverdue}>!</span>
						Просроченных:
						<span className={css.valueOverdue}>{taskStats.overdue}</span>
					</TextField>
				)}

				<TextField className={css.taskRow}>
					<span className={css.iconUrgent}>●</span>
					Срочных:
					<span className={taskStats.urgent > 0 ? css.valueUrgent : ''}>{taskStats.urgent}</span>
				</TextField>

				<TextField className={css.taskRow}>
					<span className={css.iconHigh}>●</span>
					Высокий приоритет:
					<span className={taskStats.high > 0 ? css.valueHigh : ''}>{taskStats.high}</span>
				</TextField>

				<TextField className={css.taskRow}>
					<span className={css.iconNormal}>●</span>
					Обычный приоритет:
					<span>{taskStats.normal}</span>
				</TextField>

				<TextField className={css.taskRow}>
					<span className={css.iconLow}>●</span>
					Низкий приоритет:
					<span>{taskStats.low}</span>
				</TextField>

				<TextField className={css.footer} size={'small'}>
					Выполнено всего: {taskStats.completed}
				</TextField>
			</ContentBlock>
		</Grid.Col>
	);
};
