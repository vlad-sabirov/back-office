import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import { CalendarEventService, ICalendarEventEntity, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import { Grid } from '@mantine/core';
import { StaffOrganizedMeetingsModal } from './StaffOrganizedMeetingsModal';
import { StaffArchivedMeetingsModal } from './StaffArchivedMeetingsModal';
import css from './staff-organized-meetings.module.scss';

const MAX_VISIBLE = 5;

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

export const StaffOrganizedMeetings: FC = () => {
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

	const [meetings, setMeetings] = useState<ICalendarEventEntity[]>([]);
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
			fetchEvents({ where: { authorId: user.id } });
		}
	}, [user?.id]);

	// Реактивно обновляем — срабатывает при рефетче и при автоинвалидации тегов RTK Query
	useEffect(() => {
		if (!rawMeetingsData) return;
		const organized = rawMeetingsData
			.filter((e) => (e as any).participants?.length > 0)
			.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
		setMeetings(organized);
	}, [rawMeetingsData]);

	const handleReload = useCallback(() => {
		if (user?.id) fetchEvents({ where: { authorId: user.id } });
	}, [user?.id, fetchEvents]);

	const activeMeetings = useMemo(
		() => meetings.filter((m) => !m.status || m.status === EnCalendarEventStatus.Active),
		[meetings]
	);
	const completedMeetings = useMemo(
		() => meetings.filter((m) => m.status === EnCalendarEventStatus.Completed),
		[meetings]
	);
	const cancelledMeetings = useMemo(
		() => meetings.filter((m) => m.status === EnCalendarEventStatus.Cancelled),
		[meetings]
	);

	const visibleActive = useMemo(() => activeMeetings.slice(0, MAX_VISIBLE), [activeMeetings]);
	const hasMore = activeMeetings.length > MAX_VISIBLE;

	if (!canView) return null;
	if (meetings.length === 0) return null;

	return (
		<Grid.Col span={100}>
			<ContentBlock className={css.root}>
				<div className={css.header}>
					<TextField mode={'heading'} size={'small'}>
						Организованные встречи
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
						visibleActive.map((meeting) => (
							<MeetingItem key={meeting.id} meeting={meeting} onClick={setViewingMeeting} />
						))
					)}
				</div>

				{hasMore && (
					<div className={css.activeFooter} onClick={openModal}>
						<TextField size={'small'} className={css.activeFooterText}>
							Всего встреч: {activeMeetings.length}
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
					{completedMeetings.length > 0 && (
						<Icon name={'open'} className={css.footerIcon} />
					)}
				</div>

				<div
					className={`${css.footerSecond} ${cancelledMeetings.length > 0 ? css.footerClickable : ''}`}
					onClick={cancelledMeetings.length > 0 ? () => setArchivedStatus(EnCalendarEventStatus.Cancelled) : undefined}
				>
					<TextField size={'small'} className={css.footerText}>
						Отменено: {cancelledMeetings.length}
					</TextField>
					{cancelledMeetings.length > 0 && (
						<Icon name={'open'} className={css.footerIcon} />
					)}
				</div>
			</ContentBlock>

			<StaffOrganizedMeetingsModal
				meetings={activeMeetings}
				opened={modalOpened}
				onClose={closeModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
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
