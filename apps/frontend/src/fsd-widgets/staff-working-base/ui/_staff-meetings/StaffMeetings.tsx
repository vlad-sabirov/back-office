import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import {
	CalendarEventService,
	ICalendarEventEntity,
	EnCalendarEventStatus,
	EnCalendarEventType,
} from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import { Grid } from '@mantine/core';
import { StaffMeetingsModal } from './StaffMeetingsModal';
import { StaffArchivedMeetingsModal } from './StaffArchivedMeetingsModal';
import css from './staff-meetings.module.scss';

const MAX_VISIBLE = 5;

// Статус участия (приглашения)
const INVITE_STATUS: Record<string, { label: string; className: string }> = {
	pending:  { label: 'Ожидает',   className: css.invitePending },
	accepted: { label: 'Принято',   className: css.inviteAccepted },
	declined: { label: 'Отклонено', className: css.inviteDeclined },
	assigned: { label: 'Назначен',  className: css.inviteAssigned },
};

interface IParticipation {
	status: string;
	event: ICalendarEventEntity;
}

interface IMeetingItemProps {
	participation: IParticipation;
	onClick: (meeting: ICalendarEventEntity) => void;
}

const MeetingItem: FC<IMeetingItemProps> = ({ participation, onClick }) => {
	const { event, status } = participation;

	const dateLabel = useMemo(() => {
		return format(parseISO(event.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
	}, [event.dateStart]);

	const organizer = event.author
		? `${event.author.lastName || ''} ${event.author.firstName || ''}`.trim()
		: null;

	const invite = INVITE_STATUS[status];

	return (
		<div className={css.meetingItem} onClick={() => onClick(event)}>
			<div className={css.meetingContent}>
				<div className={css.meetingTitleRow}>
					<TextField className={css.meetingTitle}>{event.title}</TextField>
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

export const StaffMeetings: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const currentRoles = useRoles();
	const staffAll = useStateSelector((state) => state.staff.data.all);

	const isOwnProfile = Number(userId) === user?.id;

	const canView = useMemo(() => {
		if (!user?.id) return false;
		if (isOwnProfile) return true;
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
	}, [user, userId, isOwnProfile, CheckAccess, currentRoles, staffAll]);

	const [participations, setParticipations] = useState<IParticipation[]>([]);
	const [modalOpened, setModalOpened] = useState(false);
	const [archivedStatus, setArchivedStatus] = useState<EnCalendarEventStatus.Completed | EnCalendarEventStatus.Cancelled | null>(null);
	const [viewingMeeting, setViewingMeeting] = useState<ICalendarEventEntity | null>(null);

	const openModal = useCallback(() => setModalOpened(true), []);
	const closeModal = useCallback(() => setModalOpened(false), []);
	const closeArchivedModal = useCallback(() => setArchivedStatus(null), []);

	const [fetchEvents, { data: rawMeetingsData }] = CalendarEventService.findMany();

	// Запускаем загрузку при изменении пользователя
	useEffect(() => {
		if (user?.id) {
			fetchEvents({ where: { participantUserId: user.id, type: EnCalendarEventType.Meeting } });
		}
	}, [user?.id]);

	// Реактивно обновляем — срабатывает при рефетче и при автоинвалидации тегов RTK Query
	useEffect(() => {
		if (!rawMeetingsData || !user?.id) return;
		const items: IParticipation[] = rawMeetingsData
			.filter((event) => event.authorId !== user.id)
			.map((event) => {
				const myParticipation = (event.participants as any[])?.find((p: any) => p.userId === user.id);
				return { status: myParticipation?.status || 'pending', event };
			});
		items.sort((a, b) => new Date(b.event.dateStart).getTime() - new Date(a.event.dateStart).getTime());
		setParticipations(items);
	}, [rawMeetingsData, user?.id]);

	const handleReload = useCallback(() => {
		if (user?.id) fetchEvents({ where: { participantUserId: user.id, type: EnCalendarEventType.Meeting } });
	}, [user?.id, fetchEvents]);

	const activeParticipations = useMemo(
		() => participations.filter(
			(p) => !p.event.status || p.event.status === EnCalendarEventStatus.Active
		),
		[participations]
	);
	const completedMeetings = useMemo(
		() => participations.filter((p) => p.event.status === EnCalendarEventStatus.Completed).map((p) => p.event),
		[participations]
	);
	const cancelledMeetings = useMemo(
		() => participations.filter((p) => p.event.status === EnCalendarEventStatus.Cancelled).map((p) => p.event),
		[participations]
	);

	const visibleActive = useMemo(() => activeParticipations.slice(0, MAX_VISIBLE), [activeParticipations]);
	const hasMore = activeParticipations.length > MAX_VISIBLE;
	const activeMeetings = useMemo(() => activeParticipations.map((p) => p.event), [activeParticipations]);

	if (!canView) return null;
	if (participations.length === 0) return null;

	return (
		<Grid.Col span={100}>
			<ContentBlock className={css.root}>
				<div className={css.header}>
					<TextField mode={'heading'} size={'small'}>
						Встречи как участник
					</TextField>
					{hasMore && (
						<Button className={css.openAllBtn} onClick={openModal}>
							<Icon name={'open'} />
						</Button>
					)}
				</div>

				<div className={css.meetingsList}>
					{visibleActive.length === 0 ? (
						<TextField className={css.empty}>Нет активных встреч</TextField>
					) : (
						visibleActive.map((p, i) => (
							<MeetingItem key={`${p.event.id}-${i}`} participation={p} onClick={setViewingMeeting} />
						))
					)}
				</div>

				{hasMore && (
					<div className={css.activeFooter} onClick={openModal}>
						<TextField size={'small'} className={css.activeFooterText}>
							Всего встреч: {activeParticipations.length}
						</TextField>
						<Icon name={'open'} className={css.activeFooterIcon} />
					</div>
				)}

				<div
					className={`${css.footer} ${completedMeetings.length > 0 ? css.footerClickable : ''}`}
					onClick={completedMeetings.length > 0 ? () => setArchivedStatus(EnCalendarEventStatus.Completed) : undefined}
				>
					<TextField size={'small'} className={css.footerTextGreen}>
						Выполнено: {completedMeetings.length}
					</TextField>
					{completedMeetings.length > 0 && <Icon name={'open'} className={css.footerIcon} />}
				</div>

				<div
					className={`${css.footerSecond} ${cancelledMeetings.length > 0 ? css.footerClickable : ''}`}
					onClick={cancelledMeetings.length > 0 ? () => setArchivedStatus(EnCalendarEventStatus.Cancelled) : undefined}
				>
					<TextField size={'small'} className={css.footerText}>
						Отменено: {cancelledMeetings.length}
					</TextField>
					{cancelledMeetings.length > 0 && <Icon name={'open'} className={css.footerIcon} />}
				</div>
			</ContentBlock>

			<StaffMeetingsModal
				meetings={activeMeetings}
				opened={modalOpened}
				onClose={closeModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				userId={user?.id}
				onReload={handleReload}
			/>

			{archivedStatus && (
				<StaffArchivedMeetingsModal
					meetings={archivedStatus === EnCalendarEventStatus.Completed ? completedMeetings : cancelledMeetings}
					status={archivedStatus}
					opened={!!archivedStatus}
					onClose={closeArchivedModal}
					onReload={handleReload}
				/>
			)}

			<EventDetailModal
				event={viewingMeeting}
				opened={!!viewingMeeting}
				onClose={() => setViewingMeeting(null)}
				onUpdated={() => { setViewingMeeting(null); handleReload(); }}
				onDeleted={() => { setViewingMeeting(null); handleReload(); }}
			/>
		</Grid.Col>
	);
};
