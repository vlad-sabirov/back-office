import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { CrmTaskService, ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { StaffTasksModal } from './StaffTasksModal';
import { StaffEventsModal } from './StaffEventsModal';
import css from './staff-tasks.module.scss';

export const StaffTasks: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();
	const [tasks, setTasks] = useState<ICrmTaskEntity[]>([]);
	const [events, setEvents] = useState<ICalendarEventEntity[]>([]);
	const [tasksModalOpened, setTasksModalOpened] = useState(false);
	const [completedModalOpened, setCompletedModalOpened] = useState(false);
	const [eventsModalOpened, setEventsModalOpened] = useState(false);
	const [completedEventsModalOpened, setCompletedEventsModalOpened] = useState(false);
	const [cancelledEventsModalOpened, setCancelledEventsModalOpened] = useState(false);

	const openTasksModal = useCallback(() => setTasksModalOpened(true), []);
	const closeTasksModal = useCallback(() => setTasksModalOpened(false), []);
	const openCompletedModal = useCallback(() => setCompletedModalOpened(true), []);
	const closeCompletedModal = useCallback(() => setCompletedModalOpened(false), []);
	const openEventsModal = useCallback(() => setEventsModalOpened(true), []);
	const closeEventsModal = useCallback(() => setEventsModalOpened(false), []);
	const openCompletedEventsModal = useCallback(() => setCompletedEventsModalOpened(true), []);
	const closeCompletedEventsModal = useCallback(() => setCompletedEventsModalOpened(false), []);
	const openCancelledEventsModal = useCallback(() => setCancelledEventsModalOpened(true), []);
	const closeCancelledEventsModal = useCallback(() => setCancelledEventsModalOpened(false), []);

	const [fetchTasks] = CrmTaskService.getByAssigneeId();
	const [fetchEvents] = CalendarEventService.findMany();

	const loadTasks = useCallback(() => {
		if (user?.id) {
			fetchTasks(user.id).then(({ data }) => {
				if (data) setTasks(data);
			});
		}
	}, [user?.id, fetchTasks]);

	const loadEvents = useCallback(() => {
		if (user?.id) {
			fetchEvents({ where: { assigneeId: user.id } }).then(({ data }) => {
				if (data) setEvents(data);
			});
		}
	}, [user?.id, fetchEvents]);

	// Загрузка задач и событий при изменении пользователя
	useEffect(() => {
		loadTasks();
		loadEvents();
	}, [loadTasks, loadEvents]);

	const handleTasksReload = useCallback(() => {
		loadTasks();
	}, [loadTasks]);

	const handleEventsReload = useCallback(() => {
		loadEvents();
	}, [loadEvents]);

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

	// Подсчет событий по типам (только активные)
	const eventStats = useMemo(() => {
		const activeEvents = events.filter(
			(e) => !e.status || e.status === EnCalendarEventStatus.Active
		);
		return {
			total: activeEvents.length,
			meeting: activeEvents.filter((e) => e.type === EnCalendarEventType.Meeting).length,
			call: activeEvents.filter((e) => e.type === EnCalendarEventType.Call).length,
			note: activeEvents.filter((e) => e.type === EnCalendarEventType.Note).length,
			reminder: activeEvents.filter((e) => e.type === EnCalendarEventType.Reminder).length,
			completed: events.filter((e) => e.status === EnCalendarEventStatus.Completed).length,
			cancelled: events.filter((e) => e.status === EnCalendarEventStatus.Cancelled).length,
		};
	}, [events]);

	// Показывать если есть данные или это текущий пользователь
	const isDisplay = user?.id && (taskStats.total > 0 || eventStats.total > 0 || userId === user.id);

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
					Задачи и события сотрудника
				</TextField>

				<div className={css.columns}>
					{/* Левый столбик — Задачи */}
					<div className={css.column}>
						<div className={css.columnHeader}>
							<TextField className={css.columnTitle}>Задачи</TextField>
							{taskStats.total > 0 && (
								<Button className={css.columnBtn} onClick={openTasksModal}>
									<Icon name={'open'} />
								</Button>
							)}
						</div>

						<TextField className={css.tasksAll} size={'large'}>
							Активных:
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
							Высокий:
							<span className={taskStats.high > 0 ? css.valueHigh : ''}>{taskStats.high}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconNormal}>●</span>
							Обычный:
							<span>{taskStats.normal}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconLow}>●</span>
							Низкий:
							<span>{taskStats.low}</span>
						</TextField>

						<div
							className={`${css.footer} ${taskStats.completed > 0 ? css.footerClickable : ''}`}
							onClick={taskStats.completed > 0 ? openCompletedModal : undefined}
						>
							<TextField size={'small'} className={css.footerText}>
								Выполнено: {taskStats.completed}
							</TextField>
							{taskStats.completed > 0 && (
								<Icon name={'open'} className={css.footerIcon} />
							)}
						</div>
					</div>

					<div className={css.divider} />

					{/* Правый столбик — События */}
					<div className={css.column}>
						<div className={css.columnHeader}>
							<TextField className={css.columnTitle}>События</TextField>
							{eventStats.total > 0 && (
								<Button className={css.columnBtn} onClick={openEventsModal}>
									<Icon name={'open'} />
								</Button>
							)}
						</div>

						<TextField className={css.tasksAll} size={'large'}>
							Активных:
							<span className={eventStats.total > 0 ? css.hasValue : ''}>{eventStats.total}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconMeeting}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Meeting].label}:
							<span>{eventStats.meeting}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconCall}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Call].label}:
							<span>{eventStats.call}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconNote}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Note].label}:
							<span>{eventStats.note}</span>
						</TextField>

						<TextField className={css.taskRow}>
							<span className={css.iconReminder}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Reminder].label}:
							<span>{eventStats.reminder}</span>
						</TextField>

						<div
							className={`${css.footer} ${eventStats.completed > 0 ? css.footerClickable : ''}`}
							onClick={eventStats.completed > 0 ? openCompletedEventsModal : undefined}
						>
							<TextField size={'small'} className={css.footerTextGreen}>
								Выполнено: {eventStats.completed}
							</TextField>
							{eventStats.completed > 0 && (
								<Icon name={'open'} className={css.footerIcon} />
							)}
						</div>

						<div
							className={`${css.footerSecond} ${eventStats.cancelled > 0 ? css.footerClickable : ''}`}
							onClick={eventStats.cancelled > 0 ? openCancelledEventsModal : undefined}
						>
							<TextField size={'small'} className={css.footerText}>
								Отменено: {eventStats.cancelled}
							</TextField>
							{eventStats.cancelled > 0 && (
								<Icon name={'open'} className={css.footerIcon} />
							)}
						</div>
					</div>
				</div>
			</ContentBlock>

			<StaffTasksModal
				tasks={tasks}
				opened={tasksModalOpened}
				onClose={closeTasksModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
			/>

			<StaffTasksModal
				tasks={tasks}
				opened={completedModalOpened}
				onClose={closeCompletedModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				completedOnly
			/>

			<StaffEventsModal
				events={events}
				opened={eventsModalOpened}
				onClose={closeEventsModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
			/>

			<StaffEventsModal
				events={events}
				opened={completedEventsModalOpened}
				onClose={closeCompletedEventsModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
				filterStatus="completed"
			/>

			<StaffEventsModal
				events={events}
				opened={cancelledEventsModalOpened}
				onClose={closeCancelledEventsModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
				filterStatus="cancelled"
			/>
		</Grid.Col>
	);
};
