import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { StaffAvatar } from '@fsd/entities/staff';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { ROLE_HIERARCHY } from '@fsd/shared/lib/role-hierarchy';
import { TextField, Icon } from '@fsd/shared/ui-kit';
import { ActionIcon } from '@mantine/core';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import css from './calendar-event.module.scss';

interface IProps {
	event: ICalendarEventEntity;
	className?: string;
}

const typeLabels: Record<string, string> = {
	[EnCalendarEventType.Meeting]: 'встречу',
	[EnCalendarEventType.Call]: 'звонок',
	[EnCalendarEventType.Note]: 'заметку',
	[EnCalendarEventType.Reminder]: 'напоминание',
};

export const CalendarEvent: FC<IProps> = ({ event, className }) => {
	const [detailModalOpened, setDetailModalOpened] = useState(false);
	const [openInEditMode, setOpenInEditMode] = useState(false);
	const historyActions = useCrmHistoryActions();

	const currentUserId = useStateSelector((state) => state.app.auth.userId);
	const currentUserRoles = useStateSelector((state) => state.app.auth.roles) || [];

	const author = useMemo(() => event.author, [event.author]);
	const assignee = useMemo(() => event.assignee, [event.assignee]);

	const canEditAndDelete = useMemo(() => {
		const isAuthor = event.authorId === Number(currentUserId);
		const isAssignee = event.assigneeId === Number(currentUserId);
		// Создал для себя — только автор может редактировать
		if (event.authorId === event.assigneeId) return isAuthor;
		const isBoss = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);
		const assigneeRoles = (event.assignee?.roles as any[] || []).map((r: any) => r.alias || r);
		const isHeadForAssignee = currentUserRoles.some((role: string) => {
			const childRole = ROLE_HIERARCHY[role];
			return childRole && assigneeRoles.includes(childRole);
		});
		const authorRoles = (event.author?.roles as any[] || []).map((r: any) => r.alias || r);
		const isCreatedByHead = authorRoles.some((r: string) => Object.keys(ROLE_HIERARCHY).includes(r));
		const canModify = isAuthor || isBoss || isHeadForAssignee;
		return canModify && !(isAssignee && !isAuthor && isCreatedByHead && !isBoss && !isHeadForAssignee);
	}, [event, currentUserId, currentUserRoles]);

	const openDetailModal = useCallback(() => {
		setOpenInEditMode(false);
		setDetailModalOpened(true);
	}, []);
	const openEditModal = useCallback(() => {
		setOpenInEditMode(true);
		setDetailModalOpened(true);
	}, []);
	const closeDetailModal = useCallback(() => {
		setDetailModalOpened(false);
		setOpenInEditMode(false);
	}, []);

	const handleUpdated = useCallback(() => {
		historyActions.reloadTimestamp();
	}, [historyActions]);

	const handleDeleted = useCallback(() => {
		historyActions.reloadTimestamp();
	}, [historyActions]);

	const createdDate = useMemo(() => {
		return format(parseISO(event.createdAt), 'dd MMMM yyyy', { locale: dateFnsLocaleRu });
	}, [event.createdAt]);

	const eventDateRange = useMemo(() => {
		const start = format(parseISO(event.dateStart), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
		const end = format(parseISO(event.dateEnd), 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleRu });
		return `${start} — ${end}`;
	}, [event.dateStart, event.dateEnd]);

	const typeConfig = CalendarEventConst.Type[event.type as EnCalendarEventType]
		|| { label: event.type, color: 'gray', icon: 'calendar' };

	const typeBadgeClass = css[`badge_${event.type}`] || css.badge_meeting;

	if (!author) {
		return null;
	}

	const typeLabel = typeLabels[event.type] || 'событие';

	return (
		<div className={`${className} ${css.eventWrapper}`} data-type={event.type}>
			<StaffAvatar user={author} size={'small'} className={css.avatar} />

			<TextField className={css.date} size={'small'}>
				{createdDate}
			</TextField>

			<div className={css.eventHeader}>
				<Icon name="calendar" className={css.eventIcon} />
				<TextField size={'small'} className={css.label}>
					Создал{author.sex === 'female' && 'а'} {typeLabel}
				</TextField>
				<div className={css.actions}>
					<ActionIcon size="sm" variant="subtle" onClick={openDetailModal} title="Подробнее">
						<Icon name="eye" className={css.actionIcon} />
					</ActionIcon>
					{canEditAndDelete && (
						<ActionIcon size="sm" variant="subtle" onClick={openEditModal} title="Редактировать">
							<Icon name="edit" className={css.actionIcon} />
						</ActionIcon>
					)}
				</div>
			</div>

			<div className={css.eventContent}>
				<TextField className={css.eventTitle}>{event.title}</TextField>

				{event.description && (
					<TextField className={css.eventDescription}>{event.description}</TextField>
				)}

				<div className={css.eventMeta}>
					<span className={`${css.badge} ${typeBadgeClass}`}>
						{typeConfig.label}
					</span>
					<span className={css.eventTime}>{eventDateRange}</span>
				</div>

				{event.location && (
					<TextField className={css.location}>
						Место: {event.location}
					</TextField>
				)}

				{assignee && assignee.id !== author?.id && (
					<div className={css.assignee}>
						<TextField size={'small'} className={css.assigneeLabel}>
							Исполнитель: {assignee.lastName} {assignee.firstName}
						</TextField>
					</div>
				)}
			</div>

			<EventDetailModal
				event={detailModalOpened ? event : null}
				opened={detailModalOpened}
				onClose={closeDetailModal}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
				defaultEditing={openInEditMode}
			/>
		</div>
	);
};
