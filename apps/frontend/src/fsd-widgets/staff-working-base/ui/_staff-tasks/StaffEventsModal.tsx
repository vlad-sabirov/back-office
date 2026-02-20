import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity, CalendarEventConst, EnCalendarEventType, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-events-modal.module.scss';

interface IProps {
	events: ICalendarEventEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
	onReload?: () => void;
	filterStatus?: 'completed' | 'cancelled';
}

const typeStyleMap: Record<string, { itemClass: string; labelClass: string }> = {
	[EnCalendarEventType.Meeting]: { itemClass: css.eventItemMeeting, labelClass: css.typeLabelMeeting },
	[EnCalendarEventType.Call]: { itemClass: css.eventItemCall, labelClass: css.typeLabelCall },
	[EnCalendarEventType.Note]: { itemClass: css.eventItemNote, labelClass: css.typeLabelNote },
	[EnCalendarEventType.Reminder]: { itemClass: css.eventItemReminder, labelClass: css.typeLabelReminder },
};

const titleMap: Record<string, string> = {
	completed: 'Выполненные события',
	cancelled: 'Отменённые события',
};

const emptyMap: Record<string, string> = {
	completed: 'Нет выполненных событий',
	cancelled: 'Нет отменённых событий',
};

export const StaffEventsModal: FC<IProps> = ({ events, opened, onClose, userName, onReload, filterStatus }) => {
	const [viewingEvent, setViewingEvent] = useState<ICalendarEventEntity | null>(null);

	const sortedEvents = useMemo(() => {
		if (filterStatus) {
			return events
				.filter((e) => e.status === filterStatus)
				.sort((a, b) => {
					const aDate = a.completedAt || a.updatedAt;
					const bDate = b.completedAt || b.updatedAt;
					return new Date(bDate).getTime() - new Date(aDate).getTime();
				});
		}

		// Активные — по дате начала (ближайшие первые)
		return events
			.filter((e) => !e.status || e.status === EnCalendarEventStatus.Active)
			.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
	}, [events, filterStatus]);

	const handleEventClick = useCallback((event: ICalendarEventEntity) => {
		setViewingEvent(event);
	}, []);

	const handleDetailClose = useCallback(() => {
		setViewingEvent(null);
	}, []);

	const handleUpdated = useCallback(() => {
		setViewingEvent(null);
		onReload?.();
	}, [onReload]);

	const handleDeleted = useCallback(() => {
		setViewingEvent(null);
		onReload?.();
	}, [onReload]);

	const modalTitle = filterStatus
		? `${titleMap[filterStatus]}: ${userName || 'сотрудника'}`
		: `События: ${userName || 'сотрудника'}`;

	const emptyMessage = filterStatus ? emptyMap[filterStatus] : 'Нет событий';

	return (
		<>
			<Modal opened={opened} onClose={onClose} title={modalTitle} size={700}>
				<div className={css.eventsList}>
					{sortedEvents.length === 0 ? (
						<TextField className={css.empty}>{emptyMessage}</TextField>
					) : (
						sortedEvents.map((event) => (
							<EventItem key={event.id} event={event} onClick={handleEventClick} />
						))
					)}
				</div>
			</Modal>

			<EventDetailModal
				event={viewingEvent}
				opened={!!viewingEvent}
				onClose={handleDetailClose}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
			/>
		</>
	);
};

interface IEventItemProps {
	event: ICalendarEventEntity;
	onClick: (event: ICalendarEventEntity) => void;
}

const EventItem: FC<IEventItemProps> = ({ event, onClick }) => {
	const typeConfig = CalendarEventConst.Type[event.type as EnCalendarEventType]
		|| { label: event.type, hex: '#96a2b6' };

	const styles = typeStyleMap[event.type] || {};

	const isCompleted = event.status === EnCalendarEventStatus.Completed;
	const isCancelled = event.status === EnCalendarEventStatus.Cancelled;
	const isDone = isCompleted || isCancelled;

	const dateRange = useMemo(() => {
		const start = format(parseISO(event.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
		const end = format(parseISO(event.dateEnd), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
		return `${start} — ${end}`;
	}, [event.dateStart, event.dateEnd]);

	const completedDate = useMemo(() => {
		if (!isDone) return null;
		const date = event.completedAt || event.updatedAt;
		return format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [event.completedAt, event.updatedAt, isDone]);

	const org = event.organization as any;
	const organizationName = org?.nameRu || org?.nameEn || null;

	const itemClass = `${css.eventItem} ${styles.itemClass || ''} ${isCompleted ? css.eventItemCompleted : ''} ${isCancelled ? css.eventItemCancelled : ''}`;

	return (
		<div className={itemClass} onClick={() => onClick(event)}>
			<div className={css.eventContent}>
				<div className={css.eventHeader}>
					<span className={css.typeDot} style={{ backgroundColor: typeConfig.hex }} />
					<TextField className={css.eventTitle}>{event.title}</TextField>
					<span className={`${css.typeLabel} ${styles.labelClass || ''}`}>
						{typeConfig.label}
					</span>
					{isCompleted && <span className={css.statusCompleted}>Выполнено</span>}
					{isCancelled && <span className={css.statusCancelled}>Отменено</span>}
				</div>
				<div className={css.eventMeta}>
					{completedDate ? (
						<div className={isDone ? (isCancelled ? css.cancelledDate : css.completedDate) : css.dateRange}>
							<Icon name="calendar" className={css.calendarIcon} />
							<span>{completedDate}</span>
						</div>
					) : (
						<div className={css.dateRange}>
							<Icon name="calendar" className={css.calendarIcon} />
							<span>{dateRange}</span>
						</div>
					)}
					{organizationName && (
						<div className={css.organization}>
							<Icon name="crm" className={css.orgIcon} />
							<span>{organizationName}</span>
						</div>
					)}
				</div>
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};
