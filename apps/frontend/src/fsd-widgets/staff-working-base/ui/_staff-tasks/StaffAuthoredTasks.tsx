import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { CrmTaskService, ICrmTaskEntity, EnCrmTaskStatus, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import { Grid } from '@mantine/core';
import { StaffTasksModal } from './StaffTasksModal';
import { StaffEventsModal } from './StaffEventsModal';
import css from './staff-tasks.module.scss';

export const StaffAuthoredTasks: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const currentRoles = useRoles();
	const staffAll = useStateSelector((state) => state.staff.data.all);

	// Проверка прав: может ли текущий пользователь видеть этот виджет
	const canView = useMemo(() => {
		if (!user?.id) return false;
		if (Number(userId) === user.id) return true;
		if (CheckAccess(['boss', 'admin', 'developer'])) return true;
		const currentUserData = staffAll.find((s: any) => s.id === Number(userId));
		const directChildIds = new Set<number>(((currentUserData as any)?.child || []).map((c: any) => c.id));
		if (directChildIds.has(user.id)) return true;
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
	const [completedTasksModalOpened, setCompletedTasksModalOpened] = useState(false);
	const [cancelledTasksModalOpened, setCancelledTasksModalOpened] = useState(false);
	const [taskCategoryFilter, setTaskCategoryFilter] = useState<{ priority?: EnCrmTaskPriority; overdue?: boolean } | null>(null);
	const [eventsModalOpened, setEventsModalOpened] = useState(false);
	const [completedEventsModalOpened, setCompletedEventsModalOpened] = useState(false);
	const [cancelledEventsModalOpened, setCancelledEventsModalOpened] = useState(false);
	const [eventCategoryFilter, setEventCategoryFilter] = useState<EnCalendarEventType | null>(null);

	const [fetchTasks, { data: rawTasksData }] = CrmTaskService.findMany();
	const [fetchEvents, { data: rawEventsData }] = CalendarEventService.findMany();

	useEffect(() => {
		if (user?.id) {
			fetchTasks({ where: { authorId: user.id } });
			fetchEvents({ where: { authorId: user.id } });
		}
	}, [user?.id]);

	useEffect(() => {
		if (rawTasksData !== undefined) {
			// Только задачи созданные для других (не для себя)
			setTasks(rawTasksData.filter((t) => t.assigneeId !== t.authorId));
		}
	}, [rawTasksData]);

	useEffect(() => {
		if (rawEventsData !== undefined) {
			// Только события созданные для других, заметки исключаем
			setEvents(rawEventsData.filter((e) => e.assigneeId !== e.authorId && e.type !== 'note'));
		}
	}, [rawEventsData]);

	const handleTasksReload = useCallback(() => {
		if (user?.id) fetchTasks({ where: { authorId: user.id } });
	}, [user?.id, fetchTasks]);

	const handleEventsReload = useCallback(() => {
		if (user?.id) fetchEvents({ where: { authorId: user.id } });
	}, [user?.id, fetchEvents]);

	// Статистика задач (только активные)
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

	// Статистика событий (только активные)
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

	if (!canView) return null;
	if (tasks.length === 0 && events.length === 0) return null;

	return (
		<Grid.Col span={100}>
			<ContentBlock className={css.root}>
				<TextField mode={'heading'} size={'small'}>
					Задачи сотрудников
				</TextField>

				<div className={css.columns}>
					{/* Левый столбик — Задачи для сотрудников */}
					<div className={css.column}>
						<div className={css.columnHeader}>
							<TextField className={css.columnTitle}>Задачи</TextField>
							{taskStats.total > 0 && (
								<Button className={css.columnBtn} onClick={() => setTasksModalOpened(true)}>
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
							onClick={taskStats.completed > 0 ? () => setCompletedTasksModalOpened(true) : undefined}
						>
							<TextField size={'small'} className={css.footerTextGreen}>
								Выполнено: {taskStats.completed}
							</TextField>
							{taskStats.completed > 0 && <Icon name={'open'} className={css.footerIcon} />}
						</div>

						<div
							className={`${css.footerSecond} ${taskStats.cancelled > 0 ? css.footerClickable : ''}`}
							onClick={taskStats.cancelled > 0 ? () => setCancelledTasksModalOpened(true) : undefined}
						>
							<TextField size={'small'} className={css.footerText}>
								Отменено: {taskStats.cancelled}
							</TextField>
							{taskStats.cancelled > 0 && <Icon name={'open'} className={css.footerIcon} />}
						</div>
					</div>

					<div className={css.divider} />

					{/* Правый столбик — События для сотрудников */}
					<div className={css.column}>
						<div className={css.columnHeader}>
							<TextField className={css.columnTitle}>События</TextField>
							{eventStats.total > 0 && (
								<Button className={css.columnBtn} onClick={() => setEventsModalOpened(true)}>
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
							onClick={eventStats.completed > 0 ? () => setCompletedEventsModalOpened(true) : undefined}
						>
							<TextField size={'small'} className={css.footerTextGreen}>
								Выполнено: {eventStats.completed}
							</TextField>
							{eventStats.completed > 0 && <Icon name={'open'} className={css.footerIcon} />}
						</div>

						<div
							className={`${css.footerSecond} ${eventStats.cancelled > 0 ? css.footerClickable : ''}`}
							onClick={eventStats.cancelled > 0 ? () => setCancelledEventsModalOpened(true) : undefined}
						>
							<TextField size={'small'} className={css.footerText}>
								Отменено: {eventStats.cancelled}
							</TextField>
							{eventStats.cancelled > 0 && <Icon name={'open'} className={css.footerIcon} />}
						</div>
					</div>
				</div>
			</ContentBlock>

			{/* Модалки задач */}
			<StaffTasksModal
				tasks={tasks}
				opened={tasksModalOpened}
				onClose={() => setTasksModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				showAssignee
			/>

			<StaffTasksModal
				tasks={tasks}
				opened={completedTasksModalOpened}
				onClose={() => setCompletedTasksModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				completedOnly
				showAssignee
			/>

			<StaffTasksModal
				tasks={tasks}
				opened={cancelledTasksModalOpened}
				onClose={() => setCancelledTasksModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				cancelledOnly
				showAssignee
			/>

			<StaffTasksModal
				tasks={tasks}
				opened={!!taskCategoryFilter}
				onClose={() => setTaskCategoryFilter(null)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleTasksReload}
				filterPriority={taskCategoryFilter?.priority}
				filterOverdue={taskCategoryFilter?.overdue}
				showAssignee
			/>

			{/* Модалки событий */}
			<StaffEventsModal
				events={events}
				opened={eventsModalOpened}
				onClose={() => setEventsModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
			/>

			<StaffEventsModal
				events={events}
				opened={completedEventsModalOpened}
				onClose={() => setCompletedEventsModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
				filterStatus="completed"
			/>

			<StaffEventsModal
				events={events}
				opened={cancelledEventsModalOpened}
				onClose={() => setCancelledEventsModalOpened(false)}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleEventsReload}
				filterStatus="cancelled"
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
