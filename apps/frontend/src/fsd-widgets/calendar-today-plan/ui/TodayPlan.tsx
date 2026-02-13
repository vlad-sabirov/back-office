import { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Grid, Loader, Text, Badge, Stack, Group, Modal, Paper, Select, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType } from '@fsd/entities/calendar-event';
import { ICrmTaskEntity, CrmTaskConst, CrmTaskService, EnCrmTaskStatus } from '@fsd/entities/crm-task';
import { ContentBlock, Icon } from '@fsd/shared/ui-kit';
import css from './TodayPlan.module.scss';

const eventTypeConfig: Record<string, { label: string; color: string }> = {
	meeting: { label: 'Встреча', color: 'blue' },
	call: { label: 'Звонок', color: 'green' },
	note: { label: 'Заметка', color: 'yellow' },
	reminder: { label: 'Напоминание', color: 'orange' },
};

const taskStatusOptions = Object.entries(CrmTaskConst.Status).map(([value, config]) => ({
	value,
	label: config.label,
}));

interface EventItemProps {
	event: ICalendarEventEntity;
	onClick?: () => void;
}

const EventItem: FC<EventItemProps> = ({ event, onClick }) => {
	const config = CalendarEventConst.Type[event.type as EnCalendarEventType];
	const timeStr = event.isAllDay
		? 'Весь день'
		: `${format(new Date(event.dateStart), 'HH:mm')} - ${format(new Date(event.dateEnd), 'HH:mm')}`;

	return (
		<div className={`${css.item} ${css.itemClickable}`} onClick={onClick}>
			<div className={css.itemTime}>{timeStr}</div>
			<div className={css.itemContent}>
				<Badge color={config?.color || 'gray'} size="xs" className={css.badge}>
					{config?.label || event.type}
				</Badge>
				<Text size="sm" weight={500} lineClamp={1}>
					{event.title}
				</Text>
				{event.organization && (
					<Text size="xs" color="dimmed" lineClamp={1}>
						{event.organization.name}
					</Text>
				)}
			</div>
		</div>
	);
};

interface TaskItemProps {
	task: ICrmTaskEntity;
	onClick?: () => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onClick }) => {
	const priorityConfig = CrmTaskConst.Priority[task.priority as keyof typeof CrmTaskConst.Priority];
	const deadlineStr = task.deadline ? format(new Date(task.deadline), 'HH:mm') : '';

	return (
		<div className={`${css.item} ${css.itemClickable}`} onClick={onClick}>
			<div className={css.itemTime}>{deadlineStr || '—'}</div>
			<div className={css.itemContent}>
				<Badge color="violet" size="xs" className={css.badge}>
					Задача
				</Badge>
				<Text size="sm" weight={500} lineClamp={1}>
					{task.title}
				</Text>
				{task.organization && (
					<Text size="xs" color="dimmed" lineClamp={1}>
						{task.organization.name}
					</Text>
				)}
			</div>
		</div>
	);
};

export const TodayPlan: FC = observer(() => {
	const router = useRouter();
	const [fetchTodayPlan, { data, isLoading }] = CalendarEventService.getTodayPlan();
	const [updateTaskStatus] = CrmTaskService.updateStatus();

	const [viewingEvent, setViewingEvent] = useState<ICalendarEventEntity | null>(null);
	const [viewingTask, setViewingTask] = useState<ICrmTaskEntity | null>(null);

	useEffect(() => {
		fetchTodayPlan();
	}, [fetchTodayPlan]);

	const todayStr = format(new Date(), "d MMMM, EEEE", { locale: ru });
	const hasItems = data && (data.events.length > 0 || data.tasks.length > 0);

	const handleCloseModal = useCallback(() => {
		setViewingEvent(null);
		setViewingTask(null);
	}, []);

	const handleTaskStatusChange = useCallback(async (status: string) => {
		if (!viewingTask) return;
		try {
			await updateTaskStatus({ id: viewingTask.id, status }).unwrap();
			showNotification({ color: 'green', message: 'Статус задачи обновлён' });
			setViewingTask({ ...viewingTask, status });
			fetchTodayPlan();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при смене статуса';
			showNotification({ color: 'red', message });
		}
	}, [viewingTask, updateTaskStatus, fetchTodayPlan]);

	const handleGoToOrganization = useCallback((orgId: number) => {
		handleCloseModal();
		router.push(`/crm/organization/${orgId}`);
	}, [router, handleCloseModal]);

	return (
		<Grid.Col span={50}>
			<ContentBlock
				title="План на сегодня"
				subtitle={todayStr}
				className={css.block}
			>
				{isLoading ? (
					<div className={css.loader}>
						<Loader size="sm" />
					</div>
				) : !hasItems ? (
					<div className={css.empty}>
						<Icon name="calendar" className={css.emptyIcon} />
						<Text size="sm" color="dimmed">
							На сегодня ничего не запланировано
						</Text>
					</div>
				) : (
					<div className={css.list}>
						{data?.events.map((event) => (
							<EventItem key={event.id} event={event} onClick={() => setViewingEvent(event)} />
						))}
						{data?.tasks.map((task) => (
							<TaskItem key={task.id} task={task} onClick={() => setViewingTask(task)} />
						))}
					</div>
				)}
			</ContentBlock>

			{/* Модалка просмотра события */}
			<Modal
				opened={!!viewingEvent}
				onClose={handleCloseModal}
				title="Событие"
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
											{(viewingEvent.organization as any).nameRu || (viewingEvent.organization as any).nameEn}
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
								<Button variant="light" onClick={() => handleGoToOrganization(viewingEvent.organizationId!)}>
									Перейти к организации
								</Button>
							)}
							<Button variant="outline" onClick={handleCloseModal}>
								Закрыть
							</Button>
						</Group>
					</Stack>
				)}
			</Modal>

			{/* Модалка просмотра задачи */}
			<Modal
				opened={!!viewingTask}
				onClose={handleCloseModal}
				title="Задача"
				size="md"
			>
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
								<Button variant="light" onClick={() => handleGoToOrganization(viewingTask.organizationId!)}>
									Перейти к организации
								</Button>
							)}
							<Button variant="outline" onClick={handleCloseModal}>
								Закрыть
							</Button>
						</Group>
					</Stack>
				)}
			</Modal>
		</Grid.Col>
	);
});
