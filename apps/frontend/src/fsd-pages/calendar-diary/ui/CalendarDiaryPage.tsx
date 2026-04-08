import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button, Select, Modal, Group, ActionIcon, Text, Stack, Badge, Paper } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Icon } from '@fsd/shared/ui-kit';
import { CalendarEventService, ICalendarEventEntity, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { ICrmTaskEntity } from '@fsd/entities/crm-task';
import { IStaffEntity } from '@fsd/entities/staff';
import { Calendar, CalendarPropsEvent, Header } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { CalendarEventForm } from '@fsd/widgets/calendar-event-form';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { TaskDetailModal } from '@fsd/features/crm-task-detail-modal';
import { HEAD_ROLES, CHILD_ROLES, getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import css from './CalendarDiaryPage.module.scss';

interface DateRange {
	from: string;
	to: string;
}

const getDateRange = (date: Date): DateRange => {
	// Расширяем диапазон для отображения недель на границах месяца
	const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
	const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });

	return {
		from: format(start, 'yyyy-MM-dd'),
		to: format(end, 'yyyy-MM-dd'),
	};
};

// Получить конфиг типа события из единого источника
const getEventTypeConfig = (type: string) => CalendarEventConst.Type[type as EnCalendarEventType];

// Цвета для ячеек календаря — задачи по приоритету
const taskPriorityColors: Record<string, string> = {
	low: '#e0e7ff',       // светло-индиго
	normal: '#bfdbfe',    // синий
	high: '#fde68a',      // жёлто-оранжевый
	urgent: '#fecaca',    // красный
};


const CalendarDiaryPage: FC = observer(() => {
	const router = useRouter();
	const CheckAccess = useAccess();
	const { user } = useUserDeprecated();
	const currentRoles = useRoles();
	const isBoss = CheckAccess(['developer', 'boss', 'admin']);
	const isHeadRole = currentRoles.some((r) => HEAD_ROLES.includes(r));
	const isChildRole = currentRoles.some((r) => CHILD_ROLES.includes(r));

	// Staff данные из Redux store
	const staffAll = useStateSelector((state) => state.staff.data.all);

	// Прямые подчинённые текущего пользователя через поле child (из API include)
	const currentUserData = useMemo(() =>
		staffAll.find((s: any) => s.id === user?.id),
	[staffAll, user?.id]);

	const directChildIds = useMemo(() => {
		const children = (currentUserData as any)?.child || [];
		return new Set<number>(children.map((c: any) => c.id));
	}, [currentUserData]);

	const hasDirectSubordinates = directChildIds.size > 0;

	const canSeeOthers = isBoss || isHeadRole || isChildRole || hasDirectSubordinates;

	// State
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const currentView = 'month' as const; // Calendar поддерживает только month
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [formModalOpened, setFormModalOpened] = useState(false);
	const [detailModalOpened, setDetailModalOpened] = useState(false);
	const [editingEvent, setEditingEvent] = useState<ICalendarEventEntity | null>(null);
	const [viewingEvent, setViewingEvent] = useState<ICalendarEventEntity | null>(null);
	const [viewingTask, setViewingTask] = useState<ICrmTaskEntity | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [dayModalOpened, setDayModalOpened] = useState(false);
	const [dayModalDate, setDayModalDate] = useState<Date | null>(null);
	const [dayModalEvents, setDayModalEvents] = useState<ICalendarEventEntity[]>([]);
	const [dayModalTasks, setDayModalTasks] = useState<ICrmTaskEntity[]>([]);

	// RTK Query
	const [fetchRangeWithTasks, { data: rangeData, isLoading, isFetching }] = CalendarEventService.getRangeWithTasks();

	// Фильтруем подчинённых для руководителей (без уволенных)
	const subordinates = useMemo(() => {
		if (!canSeeOthers || staffAll.length === 0) return [];

		// Исключаем уволенных сотрудников и текущего пользователя
		const EXCLUDED_POSITIONS = ['грузчик', 'водитель', 'техничка'];
		const activeStaff = staffAll.filter((s: IStaffEntity) => {
			if (s.isFired || s.id === user?.id) return false;
			const pos = (s.workPosition || '').toLowerCase().trim();
			return !EXCLUDED_POSITIONS.includes(pos);
		});

		// admin/developer — все сотрудники
		if (CheckAccess(['developer', 'admin'])) {
			return activeStaff;
		}

		// boss — все, кроме других boss
		if (CheckAccess(['boss'])) {
			return activeStaff.filter((s: IStaffEntity) =>
				!s.roles?.some((r) => r.alias === 'boss')
			);
		}

		// Главная роль (head) — сотрудники с дочерней ролью + прямые подчинённые
		const childRoles = getChildRolesForUser(currentRoles);
		if (childRoles.length > 0) {
			const headRoleStaff = activeStaff.filter((s: IStaffEntity) =>
				s.roles?.some((r) => childRoles.includes(r.alias))
			);

			// Прямые подчинённые через child массив текущего пользователя
			const directChildren = activeStaff.filter((s: IStaffEntity) =>
				directChildIds.has(s.id)
			);

			// Объединить без дубликатов
			const combined = new Map<number, IStaffEntity>();
			headRoleStaff.forEach((s) => combined.set(s.id, s));
			directChildren.forEach((s) => combined.set(s.id, s));
			return Array.from(combined.values());
		}

		// Дочерняя роль / руководитель без роли — прямые подчинённые через child
		return activeStaff.filter((s: IStaffEntity) => directChildIds.has(s.id));
	}, [staffAll, canSeeOthers, user?.id, CheckAccess, currentRoles, directChildIds]);

	// Определяем userId для запроса (выбранный пользователь или текущий)
	const effectiveUserId = selectedUserId || (user?.id ? String(user.id) : undefined);

	// Загрузка событий при смене даты/пользователя
	const loadEvents = useCallback(() => {
		if (!effectiveUserId) return; // Ждём пока user загрузится

		const range = getDateRange(currentDate);
		fetchRangeWithTasks({
			from: range.from,
			to: range.to,
			userId: effectiveUserId,
			// Показывать задачи/события созданные автором для подчинённых (только в своём ежедневнике)
			includeAuthored: !selectedUserId,
		});
	}, [currentDate, effectiveUserId, fetchRangeWithTasks]);

	useEffect(() => {
		loadEvents();
	}, [loadEvents]);

	// Навигация по датам (только месяцы)
	const handlePrev = useCallback(() => {
		setCurrentDate((prev) => subMonths(prev, 1));
	}, []);

	const handleNext = useCallback(() => {
		setCurrentDate((prev) => addMonths(prev, 1));
	}, []);

	const handleToday = useCallback(() => {
		setCurrentDate(new Date());
	}, []);

	// Клик по событию — показать детали
	const handleEventClick = useCallback((event: ICalendarEventEntity) => {
		setViewingEvent(event);
		setViewingTask(null);
		setDetailModalOpened(true);
	}, []);

	// Клик по задаче — показать детали
	const handleTaskClick = useCallback((task: ICrmTaskEntity) => {
		setViewingTask(task);
		setViewingEvent(null);
		setDetailModalOpened(true);
	}, []);

	// Клик по бейджу "+N ещё" — показать все события дня
	const handleDayOverflowClick = useCallback((date: Date, _events: CalendarPropsEvent[]) => {
		if (!rangeData) return;

		const targetDay = startOfDay(date);

		const dayEvents = rangeData.events.filter((e) => {
			const eventStart = startOfDay(new Date(e.dateStart));
			const eventEnd = endOfDay(new Date(e.dateEnd));
			return isWithinInterval(targetDay, { start: eventStart, end: eventEnd });
		});

		const dayTasks = rangeData.tasks.filter((t) => {
			if (!t.deadline) return false;
			return isSameDay(startOfDay(new Date(t.deadline)), targetDay);
		});

		setDayModalDate(date);
		setDayModalEvents(dayEvents);
		setDayModalTasks(dayTasks);
		setDayModalOpened(true);
	}, [rangeData]);

	// Маппинг событий для Calendar компонента с onClick
	const calendarEvents = useMemo<CalendarPropsEvent[]>(() => {
		if (!rangeData) return [];

		const currentUserId = user?.id ? Number(user.id) : null;

		const events = rangeData.events.map((event): CalendarPropsEvent => {
			// Событие создано мной для другого сотрудника
			const isAuthored = currentUserId && event.authorId === currentUserId && event.assigneeId !== currentUserId;
			const assignee = isAuthored && (event as any).assignee;
			const assigneeLabel = assignee ? ` → ${assignee.lastName || ''} ${assignee.firstName || ''}`.trim() : '';

			return {
				id: event.id,
				type: 'default',
				title: `${event.title}${assigneeLabel}`,
				description: event.description || undefined,
				dateStart: new Date(event.dateStart),
				dateEnd: new Date(event.dateEnd),
				isAllDay: event.isAllDay,
				ctx: 'event',
				color: getEventTypeConfig(event.type)?.bg || '#e0e7ff',
				onClick: () => handleEventClick(event),
			};
		});

		const tasks = rangeData.tasks
			.filter((task) => task.deadline)
			.map((task): CalendarPropsEvent => {
				// Задача создана мной для другого сотрудника
				const isAuthored = currentUserId && task.authorId === currentUserId && task.assigneeId !== currentUserId;
				const assignee = isAuthored && (task as any).assignee;
				const assigneeLabel = assignee ? ` → ${assignee.lastName || ''} ${assignee.firstName || ''}`.trim() : '';

				return {
					id: `task-${task.id}`,
					type: 'default',
					title: `📋 ${task.title}${assigneeLabel}`,
					description: task.description || undefined,
					dateStart: new Date(task.deadline!),
					dateEnd: new Date(task.deadline!),
					isAllDay: true,
					ctx: 'task',
					color: taskPriorityColors[task.priority] || '#bfdbfe',
					onClick: () => handleTaskClick(task),
				};
			});

		return [...events, ...tasks];
	}, [rangeData, handleEventClick, handleTaskClick, user?.id]);

	// Обработчики модалки формы
	const handleCreateEvent = useCallback(() => {
		setEditingEvent(null);
		setSelectedDate(currentDate);
		setFormModalOpened(true);
	}, [currentDate]);

	const handleFormModalClose = useCallback(() => {
		setFormModalOpened(false);
		setEditingEvent(null);
		setSelectedDate(null);
	}, []);

	const handleDetailModalClose = useCallback(() => {
		setDetailModalOpened(false);
		setViewingEvent(null);
		setViewingTask(null);
	}, []);

	const handleEventSaved = useCallback(() => {
		handleFormModalClose();
		loadEvents();
	}, [loadEvents, handleFormModalClose]);

	// Форматирование даты для заголовка
	const dateTitle = useMemo(() => {
		return format(currentDate, 'LLLL yyyy', { locale: ru });
	}, [currentDate]);

	// Селект пользователя для руководителей
	const userSelectData = useMemo(() => {
		const options = [{ value: '', label: 'Мой календарь' }];
		subordinates.forEach((s: IStaffEntity) => {
			options.push({
				value: String(s.id),
				label: `${s.lastName} ${s.firstName}`,
			});
		});
		return options;
	}, [subordinates]);

	return (
		<>
			<Head>
				<title>Ежедневник. Back Office</title>
			</Head>

			<div className={css.stickyTop}>
				<Header
					title="Ежедневник"
					contentRight={
						<div className={css.headerRight}>
							{canSeeOthers && subordinates.length > 0 && (
								<Select
									placeholder="Выберите сотрудника"
									data={userSelectData}
									value={selectedUserId || ''}
									onChange={(value) => setSelectedUserId(value || null)}
									clearable
									className={css.userSelect}
								/>
							)}
							<Button onClick={handleCreateEvent} className={css.btnPrimary}>Создать</Button>
						</div>
					}
					loading={isFetching}
				/>

				{/* Навигация по датам */}
				<div className={css.navigation}>
					<Group spacing="sm">
						<ActionIcon variant="light" onClick={handlePrev} title="Предыдущий месяц">
							<Icon name="arrow-small" style={{ transform: 'rotate(90deg)' }} />
						</ActionIcon>
						<Button variant="subtle" onClick={handleToday}>
							Сегодня
						</Button>
						<ActionIcon variant="light" onClick={handleNext} title="Следующий месяц">
							<Icon name="arrow-small" style={{ transform: 'rotate(-90deg)' }} />
						</ActionIcon>
						<Text weight={500} className={css.dateTitle}>{dateTitle}</Text>
					</Group>

					{isFetching && <Text size="sm" color="dimmed">Загрузка...</Text>}
				</div>
			</div>

			<div className={css.calendarWrapper}>
				<Calendar
					date={currentDate}
					view={currentView}
					views={['month']}
					events={calendarEvents}
					loading={isLoading && !rangeData}
					startDay="monday"
					onDayOverflowClick={handleDayOverflowClick}
				/>
			</div>

			{/* Модалка создания/редактирования события */}
			<Modal
				opened={formModalOpened}
				onClose={handleFormModalClose}
				title={editingEvent ? 'Редактирование события' : 'Создание'}
				size="lg"
			>
				<CalendarEventForm
					event={editingEvent}
					defaultDate={selectedDate}
					assigneeId={selectedUserId ? Number(selectedUserId) : user?.id}
					onSuccess={handleEventSaved}
					onCancel={handleFormModalClose}
				/>
			</Modal>

			{/* Модалка всех событий дня (overflow) */}
			<Modal
				opened={dayModalOpened}
				onClose={() => setDayModalOpened(false)}
				title={dayModalDate ? `Все события за ${format(dayModalDate, 'd MMMM yyyy', { locale: ru })}` : 'События дня'}
				size="md"
			>
				<Stack spacing="sm">
					{dayModalEvents.map((event) => (
						<Paper
							key={event.id}
							p="sm"
							withBorder
							style={{
								cursor: 'pointer',
								borderLeft: `4px solid ${getEventTypeConfig(event.type)?.bg || '#e0e7ff'}`,
							}}
							onClick={() => {
								setDayModalOpened(false);
								handleEventClick(event);
							}}
						>
							<Group position="apart">
								<div>
									<Text weight={500}>{event.title}</Text>
									{event.description && (
										<Text size="sm" color="dimmed" lineClamp={1}>{event.description}</Text>
									)}
								</div>
								<Badge color={getEventTypeConfig(event.type)?.color || 'gray'} size="sm">
									{getEventTypeConfig(event.type)?.label || event.type}
								</Badge>
							</Group>
							<Text size="xs" color="dimmed" mt={4}>
								{format(new Date(event.dateStart), 'HH:mm', { locale: ru })}
								{' — '}
								{format(new Date(event.dateEnd), 'HH:mm', { locale: ru })}
							</Text>
						</Paper>
					))}

					{dayModalTasks.map((task) => (
						<Paper
							key={task.id}
							p="sm"
							withBorder
							style={{
								cursor: 'pointer',
								borderLeft: `4px solid ${taskPriorityColors[task.priority] || '#bfdbfe'}`,
							}}
							onClick={() => {
								setDayModalOpened(false);
								handleTaskClick(task);
							}}
						>
							<Group position="apart">
								<Text weight={500}>📋 {task.title}</Text>
								<Badge color="violet" size="sm">Задача</Badge>
							</Group>
							{task.description && (
								<Text size="sm" color="dimmed" lineClamp={1}>{task.description}</Text>
							)}
						</Paper>
					))}

					{dayModalEvents.length === 0 && dayModalTasks.length === 0 && (
						<Text color="dimmed" align="center">Нет событий</Text>
					)}
				</Stack>
			</Modal>

			<EventDetailModal
				event={viewingEvent}
				opened={detailModalOpened && !!viewingEvent}
				onClose={handleDetailModalClose}
				onUpdated={loadEvents}
				onDeleted={loadEvents}
			/>

			<TaskDetailModal
				task={viewingTask}
				opened={detailModalOpened && !!viewingTask}
				onClose={handleDetailModalClose}
				onUpdated={loadEvents}
				onDeleted={loadEvents}
			/>
		</>
	);
});

export default CalendarDiaryPage;
