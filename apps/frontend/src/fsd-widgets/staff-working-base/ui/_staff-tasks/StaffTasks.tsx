import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { CrmTaskService, ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { HEAD_ROLES, CHILD_ROLES, getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import { Grid } from '@mantine/core';
import { StaffTasksModal } from './StaffTasksModal';
import { StaffEventsModal } from './StaffEventsModal';
import css from './staff-tasks.module.scss';

export const StaffTasks: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const currentRoles = useRoles();
	const staffAll = useStateSelector((state) => state.staff.data.all);

	// Проверка прав на просмотр задач/событий сотрудника
	const canView = useMemo(() => {
		if (!user?.id) return false;
		// Сам сотрудник
		if (Number(userId) === user.id) return true;
		// Boss / admin / developer
		if (CheckAccess(['boss', 'admin', 'developer'])) return true;
		// Прямые подчинённые через child массив текущего пользователя
		const currentUserData = staffAll.find((s: any) => s.id === Number(userId));
		const directChildIds = new Set<number>(((currentUserData as any)?.child || []).map((c: any) => c.id));
		if (directChildIds.has(user.id)) return true;
		// Head роль — проверяем роли сотрудника профиля
		const childRoles = getChildRolesForUser(currentRoles);
		if (childRoles.length > 0) {
			const profileRoles = (user.roles as any[] || []).map((r: any) => r.alias || r);
			if (profileRoles.some((r: string) => childRoles.includes(r))) return true;
		}
		return false;
	}, [user, userId, CheckAccess, currentRoles, staffAll]);
	const [tasks, setTasks] = useState<ICrmTaskEntity[]>([]);
	const [events, setEvents] = useState<ICalendarEventEntity[]>([]);
	const [tasksModalOpened, setTasksModalOpened] = useState(false);
	const [completedModalOpened, setCompletedModalOpened] = useState(false);
	const [cancelledModalOpened, setCancelledModalOpened] = useState(false);
	const [taskCategoryFilter, setTaskCategoryFilter] = useState<{ priority?: EnCrmTaskPriority; overdue?: boolean } | null>(null);
	const [eventCategoryFilter, setEventCategoryFilter] = useState<EnCalendarEventType | null>(null);
	const [eventsModalOpened, setEventsModalOpened] = useState(false);
	const [completedEventsModalOpened, setCompletedEventsModalOpened] = useState(false);
	const [cancelledEventsModalOpened, setCancelledEventsModalOpened] = useState(false);

	const openTasksModal = useCallback(() => setTasksModalOpened(true), []);
	const closeTasksModal = useCallback(() => setTasksModalOpened(false), []);
	const openCompletedModal = useCallback(() => setCompletedModalOpened(true), []);
	const closeCompletedModal = useCallback(() => setCompletedModalOpened(false), []);
	const openCancelledModal = useCallback(() => setCancelledModalOpened(true), []);
	const closeCancelledModal = useCallback(() => setCancelledModalOpened(false), []);
	const openEventsModal = useCallback(() => setEventsModalOpened(true), []);
	const closeEventsModal = useCallback(() => setEventsModalOpened(false), []);
	const openCompletedEventsModal = useCallback(() => setCompletedEventsModalOpened(true), []);
	const closeCompletedEventsModal = useCallback(() => setCompletedEventsModalOpened(false), []);
	const openCancelledEventsModal = useCallback(() => setCancelledEventsModalOpened(true), []);
	const closeCancelledEventsModal = useCallback(() => setCancelledEventsModalOpened(false), []);

	const [fetchTasks, { data: rawTasksData }] = CrmTaskService.getByAssigneeId();
	const [fetchEvents, { data: rawEventsData }] = CalendarEventService.findMany();

	// Запускаем загрузку при изменении пользователя
	useEffect(() => {
		if (user?.id) {
			fetchTasks(user.id);
			fetchEvents({ where: { assigneeId: user.id } });
		}
	}, [user?.id]);

	// Реактивно обновляем локальный стейт — срабатывает и при ручном рефетче, и при автоинвалидации тегов RTK Query
	useEffect(() => {
		if (rawTasksData !== undefined) setTasks(rawTasksData);
	}, [rawTasksData]);

	useEffect(() => {
		if (rawEventsData !== undefined) setEvents(rawEventsData.filter((e) => e.type !== 'note'));
	}, [rawEventsData]);

	const handleTasksReload = useCallback(() => {
		if (user?.id) fetchTasks(user.id);
	}, [user?.id, fetchTasks]);

	const handleEventsReload = useCallback(() => {
		if (user?.id) fetchEvents({ where: { assigneeId: user.id } });
	}, [user?.id, fetchEvents]);

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
			cancelled: tasks.filter((t) => t.status === EnCrmTaskStatus.Cancelled).length,
			overdue: activeTasks.filter((t) => {
				if (!t.deadline) return false;
				return new Date(t.deadline) < new Date();
			}).length,
		};
	}, [tasks]);

	// Подсчет событий по типам (только активные, заметки исключены)
	const eventStats = useMemo(() => {
		const activeEvents = events.filter(
			(e) => !e.status || e.status === EnCalendarEventStatus.Active
		);
		return {
			total: activeEvents.length,
			meeting: activeEvents.filter((e) => e.type === EnCalendarEventType.Meeting).length,
			call: activeEvents.filter((e) => e.type === EnCalendarEventType.Call).length,
			reminder: activeEvents.filter((e) => e.type === EnCalendarEventType.Reminder).length,
			completed: events.filter((e) => e.status === EnCalendarEventStatus.Completed).length,
			cancelled: events.filter((e) => e.status === EnCalendarEventStatus.Cancelled).length,
		};
	}, [events]);

	// Показывать только если есть права на просмотр
	const isDisplay = canView;

	if (!isDisplay) {
		return null;
	}

	return (
		<Grid.Col span={100}>
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
							<div
								className={`${css.taskRow} ${css.taskRowClickable}`}
								onClick={() => setTaskCategoryFilter({ overdue: true })}
							>
								<span className={css.iconOverdue}>!</span>
								Просроченных:
								<span className={css.valueOverdue}>{taskStats.overdue}</span>
								<Icon name={'open'} className={css.rowOpenIcon} />
							</div>
						)}

						<div
							className={`${css.taskRow} ${taskStats.urgent > 0 ? css.taskRowClickable : ''}`}
							onClick={taskStats.urgent > 0 ? () => setTaskCategoryFilter({ priority: EnCrmTaskPriority.Urgent }) : undefined}
						>
							<span className={css.iconUrgent}>●</span>
							Срочных:
							<span className={taskStats.urgent > 0 ? css.valueUrgent : ''}>{taskStats.urgent}</span>
							{taskStats.urgent > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

						<div
							className={`${css.taskRow} ${taskStats.high > 0 ? css.taskRowClickable : ''}`}
							onClick={taskStats.high > 0 ? () => setTaskCategoryFilter({ priority: EnCrmTaskPriority.High }) : undefined}
						>
							<span className={css.iconHigh}>●</span>
							Высокий:
							<span className={taskStats.high > 0 ? css.valueHigh : ''}>{taskStats.high}</span>
							{taskStats.high > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

						<div
							className={`${css.taskRow} ${taskStats.normal > 0 ? css.taskRowClickable : ''}`}
							onClick={taskStats.normal > 0 ? () => setTaskCategoryFilter({ priority: EnCrmTaskPriority.Normal }) : undefined}
						>
							<span className={css.iconNormal}>●</span>
							Обычный:
							<span>{taskStats.normal}</span>
							{taskStats.normal > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

						<div
							className={`${css.taskRow} ${taskStats.low > 0 ? css.taskRowClickable : ''}`}
							onClick={taskStats.low > 0 ? () => setTaskCategoryFilter({ priority: EnCrmTaskPriority.Low }) : undefined}
						>
							<span className={css.iconLow}>●</span>
							Низкий:
							<span>{taskStats.low}</span>
							{taskStats.low > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

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

						<div
							className={`${css.footerSecond} ${taskStats.cancelled > 0 ? css.footerClickable : ''}`}
							onClick={taskStats.cancelled > 0 ? openCancelledModal : undefined}
						>
							<TextField size={'small'} className={css.footerText}>
								Отменено: {taskStats.cancelled}
							</TextField>
							{taskStats.cancelled > 0 && (
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

						<div
							className={`${css.taskRow} ${eventStats.meeting > 0 ? css.taskRowClickable : ''}`}
							onClick={eventStats.meeting > 0 ? () => setEventCategoryFilter(EnCalendarEventType.Meeting) : undefined}
						>
							<span className={css.iconMeeting}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Meeting].label}:
							<span>{eventStats.meeting}</span>
							{eventStats.meeting > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

						<div
							className={`${css.taskRow} ${eventStats.call > 0 ? css.taskRowClickable : ''}`}
							onClick={eventStats.call > 0 ? () => setEventCategoryFilter(EnCalendarEventType.Call) : undefined}
						>
							<span className={css.iconCall}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Call].label}:
							<span>{eventStats.call}</span>
							{eventStats.call > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

						<div
							className={`${css.taskRow} ${eventStats.reminder > 0 ? css.taskRowClickable : ''}`}
							onClick={eventStats.reminder > 0 ? () => setEventCategoryFilter(EnCalendarEventType.Reminder) : undefined}
						>
							<span className={css.iconReminder}>●</span>
							{CalendarEventConst.Type[EnCalendarEventType.Reminder].label}:
							<span>{eventStats.reminder}</span>
							{eventStats.reminder > 0 && <Icon name={'open'} className={css.rowOpenIcon} />}
						</div>

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

			<StaffTasksModal
				tasks={tasks}
				opened={cancelledModalOpened}
				onClose={closeCancelledModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				cancelledOnly
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

			<StaffTasksModal
				tasks={tasks}
				opened={!!taskCategoryFilter}
				onClose={() => setTaskCategoryFilter(null)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				filterPriority={taskCategoryFilter?.priority}
				filterOverdue={taskCategoryFilter?.overdue}
			/>

			<StaffEventsModal
				events={events}
				opened={eventCategoryFilter !== null}
				onClose={() => setEventCategoryFilter(null)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
				filterType={eventCategoryFilter ?? undefined}
			/>
		</Grid.Col>
	);
};
