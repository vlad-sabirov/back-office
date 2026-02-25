import { FC, useMemo, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { ICalendarEventEntity } from '@fsd/entities/calendar-event';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { Modal, TextField, Icon } from '@fsd/shared/ui-kit';
import css from './staff-notes.module.scss';

const SENTINEL_YEAR = 2099;

interface IProps {
	notes: ICalendarEventEntity[];
	opened: boolean;
	onClose: () => void;
	userName?: string;
	onReload?: () => void;
}

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

export const StaffNotesModal: FC<IProps> = ({ notes, opened, onClose, userName, onReload }) => {
	const [viewingNote, setViewingNote] = useState<ICalendarEventEntity | null>(null);

	const sortedNotes = useMemo(() => {
		return [...notes].sort(
			(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
	}, [notes]);

	const handleNoteClick = useCallback((note: ICalendarEventEntity) => {
		setViewingNote(note);
	}, []);

	const handleDetailClose = useCallback(() => {
		setViewingNote(null);
	}, []);

	const handleUpdated = useCallback(() => {
		setViewingNote(null);
		onReload?.();
	}, [onReload]);

	const handleDeleted = useCallback(() => {
		setViewingNote(null);
		onReload?.();
	}, [onReload]);

	return (
		<>
			<Modal opened={opened} onClose={onClose} title={`Заметки: ${userName || 'сотрудника'}`} size={700}>
				<div className={css.notesList}>
					{sortedNotes.length === 0 ? (
						<TextField className={css.empty}>Нет заметок</TextField>
					) : (
						sortedNotes.map((note) => (
							<NoteItem key={note.id} note={note} onClick={handleNoteClick} />
						))
					)}
				</div>
			</Modal>

			<EventDetailModal
				event={viewingNote}
				opened={!!viewingNote}
				onClose={handleDetailClose}
				onUpdated={handleUpdated}
				onDeleted={handleDeleted}
			/>
		</>
	);
};
