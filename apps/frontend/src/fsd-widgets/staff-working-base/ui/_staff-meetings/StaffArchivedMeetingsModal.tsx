import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-meetings.module.scss';

interface IProps {
	meetings: ICalendarEventEntity[];
	status: EnCalendarEventStatus.Completed | EnCalendarEventStatus.Cancelled;
	opened: boolean;
	onClose: () => void;
	onReload?: () => void;
}

const TITLES = {
	[EnCalendarEventStatus.Completed]: 'Выполненные встречи',
	[EnCalendarEventStatus.Cancelled]: 'Отменённые встречи',
};

interface IItemProps {
	meeting: ICalendarEventEntity;
	onClick: (meeting: ICalendarEventEntity) => void;
}

const Item: FC<IItemProps> = ({ meeting, onClick }) => {
	const isCompleted = meeting.status === EnCalendarEventStatus.Completed;
	const isCancelled = meeting.status === EnCalendarEventStatus.Cancelled;

	const dateLabel = useMemo(() => {
		return format(parseISO(meeting.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [meeting.dateStart]);

	const closedDate = useMemo(() => {
		const raw = meeting.completedAt || meeting.updatedAt;
		if (!raw) return null;
		return format(parseISO(raw), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [meeting.completedAt, meeting.updatedAt]);

	const organizer = meeting.author
		? `${meeting.author.lastName || ''} ${meeting.author.firstName || ''}`.trim()
		: null;

	const participantCount = (meeting as any).participants?.length;

	const itemClass = `${css.meetingItem} ${isCompleted ? css.meetingItemCompleted : ''} ${isCancelled ? css.meetingItemCancelled : ''}`;

	return (
		<div className={itemClass} onClick={() => onClick(meeting)}>
			<div className={css.meetingContent}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
					<TextField className={css.meetingTitle} style={{ flex: 1, minWidth: 0 }}>
						{meeting.title}
					</TextField>
					{isCompleted && <span className={css.statusCompleted}>Выполнено</span>}
					{isCancelled && <span className={css.statusCancelled}>Отменено</span>}
				</div>

				{organizer && (
					<TextField className={css.meetingMeta}>Организатор: {organizer}</TextField>
				)}
				{participantCount > 0 && (
					<TextField className={css.meetingMeta}>Участников: {participantCount}</TextField>
				)}

				{closedDate ? (
					<div className={isCompleted ? css.completedDate : css.cancelledDate}>
						<Icon name="calendar" className={css.calendarIcon} />
						<span>{closedDate}</span>
					</div>
				) : (
					<div className={css.meetingDate}>{dateLabel}</div>
				)}
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};

export const StaffArchivedMeetingsModal: FC<IProps> = ({ meetings, status, opened, onClose, onReload }) => {
	const [viewingMeeting, setViewingMeeting] = useState<ICalendarEventEntity | null>(null);

	const sorted = useMemo(() => {
		return [...meetings].sort((a, b) => {
			const aDate = a.completedAt || a.updatedAt;
			const bDate = b.completedAt || b.updatedAt;
			return new Date(bDate).getTime() - new Date(aDate).getTime();
		});
	}, [meetings]);

	const handleClose = useCallback(() => setViewingMeeting(null), []);
	const handleUpdated = useCallback(() => { setViewingMeeting(null); onReload?.(); }, [onReload]);
	const handleDeleted = useCallback(() => { setViewingMeeting(null); onReload?.(); }, [onReload]);

	return (
		<>
			<Modal opened={opened} onClose={onClose} title={TITLES[status]} size={700}>
				<div className={css.meetingsList}>
					{sorted.length === 0 ? (
						<TextField className={css.empty}>Нет встреч</TextField>
					) : (
						sorted.map((m) => (
							<Item key={m.id} meeting={m} onClick={setViewingMeeting} />
						))
					)}
				</div>
			</Modal>

			<EventDetailModal
				event={viewingMeeting}
				opened={!!viewingMeeting}
				onClose={handleClose}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
			/>
		</>
	);
};
