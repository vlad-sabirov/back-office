import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button, Select, Modal, Group, ActionIcon, Text, Stack, Badge, Paper } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Icon } from '@fsd/shared/ui-kit';
import { CalendarEventService, ICalendarEventEntity, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { ICrmTaskEntity, CrmTaskService, CrmTaskConst, EnCrmTaskStatus } from '@fsd/entities/crm-task';
import { IStaffEntity } from '@fsd/entities/staff';
import { Calendar, CalendarPropsEvent, Header } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated } from '@hooks';
import { CalendarEventForm } from '@fsd/widgets/calendar-event-form';
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

// Типы событий для отображения
const eventTypeConfig: Record<string, { label: string; color: string }> = {
	meeting: { label: 'Встреча', color: 'blue' },
	call: { label: 'Звонок', color: 'green' },
	note: { label: 'Заметка', color: 'yellow' },
	reminder: { label: 'Напоминание', color: 'orange' },
};

// Цвета для ячеек календаря — события
const eventCalendarColors: Record<string, string> = {
	meeting: '#dbeafe',   // голубой
	call: '#d1fae5',      // зелёный
	note: '#fef9c3',      // жёлтый
	reminder: '#f3e8ff',  // фиолетовый
};

// Цвета для ячеек календаря — задачи по приоритету
const taskPriorityColors: Record<string, string> = {
	low: '#e0e7ff',       // светло-индиго
	normal: '#bfdbfe',    // синий
	high: '#fde68a',      // жёлто-оранжевый
	urgent: '#fecaca',    // красный
};


const taskStatusOptions = Object.entries(CrmTaskConst.Status).map(([value, config]) => ({
	value,
	label: config.label,
}));

const CalendarDiaryPage: FC = observer(() => {
	const router = useRouter();
	const CheckAccess = useAccess();
	const { user } = useUserDeprecated();
	const isBoss = CheckAccess(['developer', 'boss', 'crmAdmin', 'admin']);
	const [updateTaskStatus] = CrmTaskService.updateStatus();

	// Staff данные из Redux store
	const staffAll = useStateSelector((state) => state.staff.data.all);

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

	// RTK Query
	const [fetchRangeWithTasks, { data: rangeData, isLoading, isFetching }] = CalendarEventService.getRangeWithTasks();

	// Фильтруем подчинённых для руководителей
	const subordinates = useMemo(() => {
		if (!isBoss || staffAll.length === 0) return [];
		// Для boss/admin показываем всех сотрудников
		if (CheckAccess(['developer', 'boss', 'admin'])) {
			return staffAll;
		}
		// Для crmAdmin показываем только своих подчинённых
		return staffAll.filter((s: IStaffEntity) => {
			const parentId = s.parentId ?? s.parent?.id;
			return parentId === user?.id;
		});
	}, [staffAll, isBoss, user?.id, CheckAccess]);

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

	// Маппинг событий для Calendar компонента с onClick
	const calendarEvents = useMemo<CalendarPropsEvent[]>(() => {
		if (!rangeData) return [];

		const events = rangeData.events.map((event): CalendarPropsEvent => ({
			id: event.id,
			type: 'default',
			title: event.title,
			description: event.description || undefined,
			dateStart: new Date(event.dateStart),
			dateEnd: new Date(event.dateEnd),
			isAllDay: event.isAllDay,
			ctx: 'event',
			color: eventCalendarColors[event.type] || '#e0e7ff',
			onClick: () => handleEventClick(event),
		}));

		const tasks = rangeData.tasks
			.filter((task) => task.deadline)
			.map((task): CalendarPropsEvent => ({
				id: `task-${task.id}`,
				type: 'default',
				title: `📋 ${task.title}`,
				description: task.description || undefined,
				dateStart: new Date(task.deadline!),
				dateEnd: new Date(task.deadline!),
				isAllDay: true,
				ctx: 'task',
				color: taskPriorityColors[task.priority] || '#bfdbfe',
				onClick: () => handleTaskClick(task),
			}));

		return [...events, ...tasks];
	}, [rangeData, handleEventClick, handleTaskClick]);

	// Обработчики модалки формы
	const handleCreateEvent = useCallback(() => {
		setEditingEvent(null);
		setSelectedDate(currentDate);
		setFormModalOpened(true);
	}, [currentDate]);

	const handleEditEvent = useCallback(() => {
		if (viewingEvent) {
			setEditingEvent(viewingEvent);
			setDetailModalOpened(false);
			setFormModalOpened(true);
		}
	}, [viewingEvent]);

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

	// Смена статуса задачи
	const handleTaskStatusChange = useCallback(async (status: string) => {
		if (!viewingTask) return;
		try {
			await updateTaskStatus({ id: viewingTask.id, status }).unwrap();
			showNotification({ color: 'green', message: 'Статус задачи обновлён' });
			setViewingTask({ ...viewingTask, status });
			loadEvents();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при смене статуса';
			showNotification({ color: 'red', message });
		}
	}, [viewingTask, updateTaskStatus, loadEvents]);

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

			<Header
				title="Ежедневник"
				contentRight={
					<div className={css.headerRight}>
						{isBoss && subordinates.length > 0 && (
							<Select
								placeholder="Выберите сотрудника"
								data={userSelectData}
								value={selectedUserId || ''}
								onChange={(value) => setSelectedUserId(value || null)}
								clearable
								className={css.userSelect}
							/>
						)}
						<Button onClick={handleCreateEvent}>Создать событие</Button>
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

			<div className={css.calendarWrapper}>
				<Calendar
					date={currentDate}
					view={currentView}
					views={['month']}
					events={calendarEvents}
					loading={isLoading && !rangeData}
					startDay="monday"
				/>
			</div>

			{/* Модалка создания/редактирования события */}
			<Modal
				opened={formModalOpened}
				onClose={handleFormModalClose}
				title={editingEvent ? 'Редактирование события' : 'Создание события'}
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

			{/* Модалка просмотра события */}
			<Modal
				opened={detailModalOpened}
				onClose={handleDetailModalClose}
				title={viewingEvent ? 'Событие' : 'Задача'}
				size="md"
			>
				{viewingEvent && (
					<Stack spacing="md">
						<Group position="apart">
							<Badge color={eventTypeConfig[viewingEvent.type]?.color || 'gray'}>
								{eventTypeConfig[viewingEvent.type]?.label || viewingEvent.type}
							</Badge>
							{viewingEvent.isAllDay && <Badge color="gray">Весь день</Badge>}
						</Group>

						<Text size="xl" weight={600}>{viewingEvent.title}</Text>

						{viewingEvent.description && (
							<Text color="dimmed">{viewingEvent.description}</Text>
						)}

						<Paper p="sm" withBorder>
							<Stack spacing="xs">
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Начало:</Text>
									<Text size="sm">
										{format(new Date(viewingEvent.dateStart), 'd MMMM yyyy, HH:mm', { locale: ru })}
									</Text>
								</Group>
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Окончание:</Text>
									<Text size="sm">
										{format(new Date(viewingEvent.dateEnd), 'd MMMM yyyy, HH:mm', { locale: ru })}
									</Text>
								</Group>
								{viewingEvent.location && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Место:</Text>
										<Text size="sm">{viewingEvent.location}</Text>
									</Group>
								)}
								{viewingEvent.assignee && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Исполнитель:</Text>
										<Text size="sm">
											{viewingEvent.assignee.lastName} {viewingEvent.assignee.firstName}
										</Text>
									</Group>
								)}
								{viewingEvent.organization && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Организация:</Text>
										<Text size="sm">
											{viewingEvent.organization.nameRu || viewingEvent.organization.nameEn}
										</Text>
									</Group>
								)}
								{viewingEvent.participants && viewingEvent.participants.length > 0 && (
									<Group spacing="xs" align="flex-start">
										<Text size="sm" color="dimmed">Участники:</Text>
										<Stack spacing={4}>
											{viewingEvent.participants.map((p: any) => (
												<Text key={p.id} size="sm">
													{p.user?.lastName} {p.user?.firstName}
													{p.status === 'accepted' && ' ✓'}
													{p.status === 'declined' && ' ✗'}
												</Text>
											))}
										</Stack>
									</Group>
								)}
							</Stack>
						</Paper>

						<Group position="right">
							{viewingEvent.organizationId && (
								<Button
									variant="light"
									onClick={() => {
										handleDetailModalClose();
										router.push(`/crm/organization/${viewingEvent.organizationId}`);
									}}
								>
									Перейти к организации
								</Button>
							)}
							<Button variant="outline" onClick={handleDetailModalClose}>
								Закрыть
							</Button>
							<Button onClick={handleEditEvent}>
								Редактировать
							</Button>
						</Group>
					</Stack>
				)}

				{viewingTask && (
					<Stack spacing="md">
						<Badge color="violet">Задача CRM</Badge>

						<Text size="xl" weight={600}>{viewingTask.title}</Text>

						{viewingTask.description && (
							<Text color="dimmed">{viewingTask.description}</Text>
						)}

						<Paper p="sm" withBorder>
							<Stack spacing="xs">
								{viewingTask.deadline && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Дедлайн:</Text>
										<Text size="sm">
											{format(new Date(viewingTask.deadline), 'd MMMM yyyy, HH:mm', { locale: ru })}
										</Text>
									</Group>
								)}
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Статус:</Text>
									<Select
										size="xs"
										data={taskStatusOptions}
										value={viewingTask.status}
										onChange={(value) => value && handleTaskStatusChange(value)}
										style={{ width: 160 }}
									/>
								</Group>
								{viewingTask.author && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Автор:</Text>
										<Text size="sm">
											{viewingTask.author.lastName} {viewingTask.author.firstName}
										</Text>
									</Group>
								)}
								{viewingTask.assignee && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Исполнитель:</Text>
										<Text size="sm">
											{viewingTask.assignee.lastName} {viewingTask.assignee.firstName}
										</Text>
									</Group>
								)}
								{viewingTask.organization && (
									<Group spacing="xs">
										<Text size="sm" color="dimmed">Организация:</Text>
										<Text size="sm">
											{(viewingTask.organization as any).nameRu || (viewingTask.organization as any).nameEn}
										</Text>
									</Group>
								)}
							</Stack>
						</Paper>

						<Group position="right">
							{viewingTask.organizationId && (
								<Button
									variant="light"
									onClick={() => {
										handleDetailModalClose();
										router.push(`/crm/organization/${viewingTask.organizationId}`);
									}}
								>
									Перейти к организации
								</Button>
							)}
							<Button variant="outline" onClick={handleDetailModalClose}>
								Закрыть
							</Button>
						</Group>
					</Stack>
				)}
			</Modal>
		</>
	);
});

export default CalendarDiaryPage;
