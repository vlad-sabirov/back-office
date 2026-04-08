import { FC, useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ActionIcon, Text, Textarea, Button, Group, Modal, ScrollArea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CrmNoteService, ICrmNoteEntity } from '@fsd/entities/crm-note';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import css from './notes.module.scss';

export const OrgNotes: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const { userId } = useUserDeprecated();
	const [fetchNotes] = CrmNoteService.getByOrganizationId();
	const [createNote, { isLoading: isCreating }] = CrmNoteService.create();
	const [updateNote] = CrmNoteService.update();
	const [removeNote] = CrmNoteService.remove();

	const [notes, setNotes] = useState<ICrmNoteEntity[]>([]);
	const [newText, setNewText] = useState('');
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editText, setEditText] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);

	const loadNotes = useCallback(async () => {
		if (!current?.id) return;
		const res = await fetchNotes(current.id);
		if (res?.data) setNotes(res.data);
	}, [current?.id, fetchNotes, reloadKey]);

	useEffect(() => {
		loadNotes();
	}, [loadNotes]);

	const reload = () => setReloadKey((k) => k + 1);

	const handleCreate = async () => {
		if (!newText.trim() || !current?.id) return;
		const res = await createNote({ text: newText.trim(), organizationId: current.id }).unwrap();
		setNewText('');
		setShowForm(false);
		showNotification({ color: 'green', message: 'Заметка добавлена' });
		setNotes((prev) => [res, ...prev]);
	};

	const handleUpdate = async (id: number) => {
		if (!editText.trim()) return;
		const res = await updateNote({ id, text: editText.trim() }).unwrap();
		setEditingId(null);
		showNotification({ color: 'green', message: 'Заметка обновлена' });
		setNotes((prev) => prev.map((n) => (n.id === id ? res : n)));
	};

	const handleDelete = async (id: number) => {
		await removeNote(id).unwrap();
		showNotification({ color: 'green', message: 'Заметка удалена' });
		setNotes((prev) => prev.filter((n) => n.id !== id));
	};

	if (!current?.id) return null;

	const visibleNotes = notes.slice(0, 3);
	const hasMore = notes.length > 3;

	const renderNote = (note: ICrmNoteEntity) => (
		<div key={note.id} className={css.note}>
			{editingId === note.id ? (
				<div className={css.editForm}>
					<Textarea
						value={editText}
						onChange={(e) => setEditText(e.currentTarget.value)}
						size="xs"
						minRows={2}
						autoFocus
					/>
					<Group spacing={4} mt={4}>
						<Button size="xs" compact onClick={() => handleUpdate(note.id)}>Сохранить</Button>
						<Button size="xs" compact variant="subtle" onClick={() => setEditingId(null)}>Отмена</Button>
					</Group>
				</div>
			) : (
				<div className={css.noteContent}>
					<Text size="sm" className={css.noteText} lineClamp={2}>{note.text}</Text>
					<div className={css.noteMeta}>
						<Text size="xs" color="dimmed">
							{note.user?.firstName} · {format(new Date(note.createdAt), 'd MMM', { locale: ru })}
						</Text>
						{note.userId === userId && (
							<div className={css.noteActions}>
								<ActionIcon size="xs" onClick={() => { setEditingId(note.id); setEditText(note.text); }}>
									<span style={{ fontSize: 10 }}>✏️</span>
								</ActionIcon>
								<ActionIcon size="xs" onClick={() => handleDelete(note.id)}>
									<span style={{ fontSize: 10 }}>🗑️</span>
								</ActionIcon>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);

	return (
		<>
			<div className={css.root}>
				{visibleNotes.length > 0 && (
					<div className={css.grid} data-count={visibleNotes.length}>
						{visibleNotes.map((note) => renderNote(note))}
					</div>
				)}

				<div className={css.toolbar}>
					{hasMore && (
						<Button variant="subtle" size="xs" compact onClick={() => setShowAll(true)}>
							Все заметки ({notes.length})
						</Button>
					)}
					{!showForm && (
						<Button variant="subtle" size="xs" compact onClick={() => setShowForm(true)}>
							+ Добавить
						</Button>
					)}
				</div>

				{showForm && (
					<div className={css.addForm}>
						<Textarea
							placeholder="Введите заметку..."
							value={newText}
							onChange={(e) => setNewText(e.currentTarget.value)}
							size="xs"
							minRows={2}
							autoFocus
							onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreate(); } }}
						/>
						<Group spacing={4} mt={4}>
							<Button size="xs" compact onClick={handleCreate} loading={isCreating}>Добавить</Button>
							<Button size="xs" compact variant="subtle" onClick={() => { setShowForm(false); setNewText(''); }}>Отмена</Button>
						</Group>
					</div>
				)}
			</div>

			<Modal opened={showAll} onClose={() => setShowAll(false)} title={`Заметки (${notes.length})`} size="md">
				<ScrollArea style={{ maxHeight: 400 }}>
					<div className={css.allNotes}>
						{notes.map((note) => renderNote(note))}
					</div>
				</ScrollArea>
				<div style={{ marginTop: 12 }}>
					<Button variant="subtle" size="xs" compact onClick={() => { setShowAll(false); setShowForm(true); }}>+ Добавить заметку</Button>
				</div>
			</Modal>
		</>
	);
};
