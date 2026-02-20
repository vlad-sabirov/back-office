import { FC, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Grid, Loader, Text, Badge, Button } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType } from '@fsd/entities/calendar-event';
import { ICrmTaskEntity } from '@fsd/entities/crm-task';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { TaskDetailModal } from '@fsd/features/crm-task-detail-modal';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import css from './TodayPlan.module.scss';

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
	const { width: screenWidth } = useViewportSize();
	const [spanCount, setSpanCount] = useState<number>(25);
	const [fetchTodayPlan, { data, isLoading }] = CalendarEventService.getTodayPlan();

	useEffect(() => {
		if (screenWidth >= 300 && screenWidth <= 1200) setSpanCount(40);
		if (screenWidth >= 1200 && screenWidth <= 1300) setSpanCount(35);
		if (screenWidth >= 1300 && screenWidth <= 1550) setSpanCount(30);
		if (screenWidth >= 1550 && screenWidth <= 1850) setSpanCount(25);
		if (screenWidth >= 1850 && screenWidth <= 2350) setSpanCount(20);
		if (screenWidth >= 2350 && screenWidth <= 2850) setSpanCount(15);
		if (screenWidth >= 2850 && screenWidth <= 3600) setSpanCount(12);
	}, [screenWidth]);

	const [viewingEvent, setViewingEvent] = useState<ICalendarEventEntity | null>(null);
	const [viewingTask, setViewingTask] = useState<ICrmTaskEntity | null>(null);

	useEffect(() => {
		fetchTodayPlan();
	}, [fetchTodayPlan]);

	const todayStr = format(new Date(), "d MMMM, EEEE", { locale: ru });
	const totalItems = (data?.events.length ?? 0) + (data?.tasks.length ?? 0);
	const hasItems = totalItems > 0;

	const dynamicSpan = useMemo(() => {
		if (totalItems <= 1) return spanCount;
		if (totalItems <= 5) return 50;
		return 100;
	}, [totalItems, spanCount]);

	const reload = () => fetchTodayPlan();

	return (
		<Grid.Col span={dynamicSpan}>
			<ContentBlock className={totalItems <= 1 ? css.block : css.blockMany}>
				<TextField mode="heading" size="small">
					План на сегодня — {todayStr}
				</TextField>

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
						<Button
							variant="light"
							size="xs"
							compact
							onClick={() => router.push('/calendar')}
						>
							Добавить задачу
						</Button>
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

			<EventDetailModal
				event={viewingEvent}
				opened={!!viewingEvent}
				onClose={() => setViewingEvent(null)}
				onUpdated={reload}
				onDeleted={reload}
			/>

			<TaskDetailModal
				task={viewingTask}
				opened={!!viewingTask}
				onClose={() => setViewingTask(null)}
				onUpdated={reload}
				onDeleted={reload}
			/>
		</Grid.Col>
	);
});
