import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import { CalendarEventService, ICalendarEventEntity } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { ContentBlock, Icon, TextField, Button } from '@fsd/shared/ui-kit';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { getChildRolesForUser } from '@fsd/shared/lib/role-hierarchy';
import { Grid } from '@mantine/core';
import { StaffNotesModal } from './StaffNotesModal';
import css from './staff-notes.module.scss';

const SENTINEL_YEAR = 2099;
const MAX_VISIBLE = 5;

interface INoteItemProps {
	note: ICalendarEventEntity;
	onClick: (note: ICalendarEventEntity) => void;
}

const NoteItem: FC<INoteItemProps> = ({ note, onClick }) => {
	const hasDate = new Date(note.dateStart).getFullYear() !== SENTINEL_YEAR;

	const dateLabel = useMemo(() => {
		if (!hasDate) return null;
		return format(parseISO(note.dateStart), 'dd MMM yyyy', { locale: dateFnsLocaleRu });
	}, [note.dateStart, hasDate]);

	return (
		<div className={css.noteItem} onClick={() => onClick(note)}>
			<div className={css.noteContent}>
				<TextField className={css.noteTitle}>{note.title}</TextField>
				{note.description && (
					<TextField className={css.noteDescription}>{note.description}</TextField>
				)}
				{dateLabel && <div className={css.noteDate}>{dateLabel}</div>}
			</div>
			<Icon name="arrow-medium" className={css.arrowIcon} />
		</div>
	);
};

export const StaffNotes: FC = () => {
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const currentRoles = useRoles();
	const staffAll = useStateSelector((state) => state.staff.data.all);

	const isOwnProfile = Number(userId) === user?.id;

	// Сам сотрудник видит все свои заметки.
	// Руководитель видит только те заметки, которые сам создал для этого сотрудника.
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

	const [notes, setNotes] = useState<ICalendarEventEntity[]>([]);
	const [modalOpened, setModalOpened] = useState(false);
	const [viewingNote, setViewingNote] = useState<ICalendarEventEntity | null>(null);

	const openModal = useCallback(() => setModalOpened(true), []);
	const closeModal = useCallback(() => setModalOpened(false), []);

	const [fetchEvents, { data: rawNotesData }] = CalendarEventService.findMany();

	// Запускаем загрузку при изменении пользователя или профиля
	useEffect(() => {
		if (user?.id && userId) {
			const where: Record<string, any> = { type: 'note', assigneeId: user.id };
			if (!isOwnProfile) where.authorId = Number(userId);
			fetchEvents({ where });
		}
	}, [user?.id, userId, isOwnProfile]);

	// Реактивно обновляем — срабатывает при рефетче и при автоинвалидации тегов RTK Query
	useEffect(() => {
		if (!rawNotesData) return;
		const sorted = [...rawNotesData].sort(
			(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
		setNotes(sorted);
	}, [rawNotesData]);

	const handleReload = useCallback(() => {
		if (user?.id && userId) {
			const where: Record<string, any> = { type: 'note', assigneeId: user.id };
			if (!isOwnProfile) where.authorId = Number(userId);
			fetchEvents({ where });
		}
	}, [user?.id, userId, isOwnProfile, fetchEvents]);

	const visibleNotes = useMemo(() => notes.slice(0, MAX_VISIBLE), [notes]);
	const hasMore = notes.length > MAX_VISIBLE;

	if (!canView) {
		return null;
	}

	const widgetTitle = isOwnProfile ? 'Заметки' : 'Мои заметки о сотруднике';

	return (
		<Grid.Col span={100}>
			<ContentBlock className={css.root}>
				<div className={css.header}>
					<TextField mode={'heading'} size={'small'}>
						{widgetTitle}
					</TextField>
					{hasMore && (
						<Button className={css.openAllBtn} onClick={openModal}>
							<Icon name={'open'} />
						</Button>
					)}
				</div>

				<div className={css.notesList}>
					{visibleNotes.length === 0 ? (
						<TextField className={css.empty}>Нет заметок</TextField>
					) : (
						visibleNotes.map((note) => (
							<NoteItem key={note.id} note={note} onClick={setViewingNote} />
						))
					)}
				</div>

				{hasMore && (
					<div className={css.footer} onClick={openModal}>
						<TextField size={'small'} className={css.footerText}>
							Всего заметок: {notes.length}
						</TextField>
						<Icon name={'open'} className={css.footerIcon} />
					</div>
				)}
			</ContentBlock>

			<StaffNotesModal
				notes={notes}
				opened={modalOpened}
				onClose={closeModal}
				userName={user ? `${user.lastName} ${user.firstName}` : undefined}
				onReload={handleReload}
			/>

			<EventDetailModal
				event={viewingNote}
				opened={!!viewingNote}
				onClose={() => setViewingNote(null)}
				onUpdated={() => { setViewingNote(null); handleReload(); }}
				onDeleted={() => { setViewingNote(null); handleReload(); }}
			/>
		</Grid.Col>
	);
};
