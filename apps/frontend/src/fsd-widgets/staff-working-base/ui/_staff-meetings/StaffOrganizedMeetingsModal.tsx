import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-organized-meetings.module.scss';

interface IProps {
	meetings: ICalendarEventEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
	onReload?: () => void;
}

interface IMeetingItemProps {
	meeting: ICalendarEventEntity;
	onClick: (meeting: ICalendarEventEntity) => void;
}

const MeetingItem: FC<IMeetingItemProps> = ({ meeting, onClick }) => {
	const dateLabel = useMemo(() => {
		return format(parseISO(meeting.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [meeting.dateStart]);

	const participants: any[] = (meeting as any).participants ?? [];
	const acceptedCount = participants.filter((p) => p.status === 'accepted').length;
	const pendingCount  = participants.filter((p) => p.status === 'pending').length;
	const declinedCount = participants.filter((p) => p.status === 'declined').length;

	return (
		<div className={css.meetingItem} onClick={() => onClick(meeting)}>
			<div className={css.meetingContent}>
				<TextField className={css.meetingTitle}>{meeting.title}</TextField>
				<div className={css.participantStatuses}>
					{acceptedCount > 0 && (
						<span className={`${css.statusBadge} ${css.statusAccepted}`}>
							Принято: {acceptedCount}
						</span>
					)}
					{pendingCount > 0 && (
						<span className={`${css.statusBadge} ${css.statusPending}`}>
							Ожидает: {pendingCount}
						</span>
					)}
					{declinedCount > 0 && (
						<span className={`${css.statusBadge} ${css.statusDeclined}`}>
							Отклонено: {declinedCount}
						</span>
					)}
					{participants.length === 0 && (
						<TextField className={css.meetingMeta}>Участников: 0</TextField>
					)}
				</div>
				<div className={css.meetingDate}>{dateLabel}</div>
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};

export const StaffOrganizedMeetingsModal: FC<IProps> = ({ meetings, opened, onClose, userName, onReload }) => {
	const [viewingMeeting, setViewingMeeting] = useState<ICalendarEventEntity | null>(null);

	const sortedMeetings = useMemo(() => {
		return [...meetings].sort(
			(a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()
		);
	}, [meetings]);

	const handleMeetingClick = useCallback((meeting: ICalendarEventEntity) => {
		setViewingMeeting(meeting);
	}, []);

	const handleDetailClose = useCallback(() => {
		setViewingMeeting(null);
	}, []);

	const handleUpdated = useCallback(() => {
		setViewingMeeting(null);
		onReload?.();
	}, [onReload]);

	const handleDeleted = useCallback(() => {
		setViewingMeeting(null);
		onReload?.();
	}, [onReload]);

	return (
		<>
			<Modal
				opened={opened}
				onClose={onClose}
				title={`Организованные встречи: ${userName || 'сотрудника'}`}
				size={700}
			>
				<div className={css.meetingsList}>
					{sortedMeetings.length === 0 ? (
						<TextField className={css.empty}>Нет встреч</TextField>
					) : (
						sortedMeetings.map((meeting) => (
							<MeetingItem key={meeting.id} meeting={meeting} onClick={handleMeetingClick} />
						))
					)}
				</div>
			</Modal>

			<EventDetailModal
				event={viewingMeeting}
				opened={!!viewingMeeting}
				onClose={handleDetailClose}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
			/>
		</>
	);
};
