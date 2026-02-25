import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-meetings.module.scss';

const INVITE_STATUS: Record<string, { label: string; className: string }> = {
	pending:  { label: 'Ожидает',   className: css.invitePending },
	accepted: { label: 'Принято',   className: css.inviteAccepted },
	declined: { label: 'Отклонено', className: css.inviteDeclined },
	assigned: { label: 'Назначен',  className: css.inviteAssigned },
};

interface IProps {
	meetings: ICalendarEventEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
	userId?: number;
	onReload?: () => void;
}

interface IMeetingItemProps {
	meeting: ICalendarEventEntity;
	userId?: number;
	onClick: (meeting: ICalendarEventEntity) => void;
}

const MeetingItem: FC<IMeetingItemProps> = ({ meeting, userId, onClick }) => {
	const dateLabel = useMemo(() => {
		return format(parseISO(meeting.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [meeting.dateStart]);

	const organizer = meeting.author
		? `${meeting.author.lastName || ''} ${meeting.author.firstName || ''}`.trim()
		: null;

	const myParticipation = (meeting.participants as any[])?.find((p: any) => p.userId === userId);
	const invite = myParticipation ? INVITE_STATUS[myParticipation.status] : undefined;

	return (
		<div className={css.meetingItem} onClick={() => onClick(meeting)}>
			<div className={css.meetingContent}>
				<div className={css.meetingTitleRow}>
					<TextField className={css.meetingTitle}>{meeting.title}</TextField>
					{invite && (
						<span className={`${css.inviteBadge} ${invite.className}`}>
							{invite.label}
						</span>
					)}
				</div>
				{organizer && (
					<TextField className={css.meetingMeta}>Организатор: {organizer}</TextField>
				)}
				<div className={css.meetingDate}>{dateLabel}</div>
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};

export const StaffMeetingsModal: FC<IProps> = ({ meetings, opened, onClose, userName, userId, onReload }) => {
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
			<Modal opened={opened} onClose={onClose} title={`Встречи как участник: ${userName || 'сотрудника'}`} size={700}>
				<div className={css.meetingsList}>
					{sortedMeetings.length === 0 ? (
						<TextField className={css.empty}>Нет встреч</TextField>
					) : (
						sortedMeetings.map((meeting) => (
							<MeetingItem key={meeting.id} meeting={meeting} userId={userId} onClick={handleMeetingClick} />
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
