import { FC, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Stack, Group, Badge, Text, Paper, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType, EnCalendarEventStatus } from '@fsd/entities/calendar-event';
import { CalendarEventForm } from '@fsd/widgets/calendar-event-form';
import { useAccess, useUserDeprecated } from '@hooks';

interface EventDetailModalProps {
	event: ICalendarEventEntity | null;
	opened: boolean;
	onClose: () => void;
	onUpdated?: () => void;
	onDeleted?: () => void;
}

export const EventDetailModal: FC<EventDetailModalProps> = ({ event, opened, onClose, onUpdated, onDeleted }) => {
	const router = useRouter();
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const isBoss = CheckAccess(['developer', 'boss', 'crmAdmin', 'admin']);
	const [deleteEvent] = CalendarEventService.delete();
	const [updateStatus] = CalendarEventService.updateStatus();
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editing, setEditing] = useState(false);

	const isAuthor = event?.author?.id === userId;
	const canModify = isAuthor || isBoss;
	const isActive = !event?.status || event?.status === EnCalendarEventStatus.Active;

	const handleDelete = useCallback(async () => {
		if (!event) return;
		try {
			await deleteEvent(event.id).unwrap();
			showNotification({ color: 'green', message: 'Событие удалено' });
			setConfirmDelete(false);
			onClose();
			onDeleted?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при удалении события';
			showNotification({ color: 'red', message });
		}
	}, [event, deleteEvent, onClose, onDeleted]);

	const handleComplete = useCallback(async () => {
		if (!event) return;
		try {
			await updateStatus({ id: event.id, status: EnCalendarEventStatus.Completed }).unwrap();
			showNotification({ color: 'green', message: 'Событие отмечено как выполненное' });
			onClose();
			onUpdated?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при обновлении статуса';
			showNotification({ color: 'red', message });
		}
	}, [event, updateStatus, onClose, onUpdated]);

	const handleCancel = useCallback(async () => {
		if (!event) return;
		try {
			await updateStatus({ id: event.id, status: EnCalendarEventStatus.Cancelled }).unwrap();
			showNotification({ color: 'orange', message: 'Событие отменено' });
			onClose();
			onUpdated?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при обновлении статуса';
			showNotification({ color: 'red', message });
		}
	}, [event, updateStatus, onClose, onUpdated]);

	const handleReactivate = useCallback(async () => {
		if (!event) return;
		try {
			await updateStatus({ id: event.id, status: EnCalendarEventStatus.Active }).unwrap();
			showNotification({ color: 'blue', message: 'Событие снова активно' });
			onClose();
			onUpdated?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при обновлении статуса';
			showNotification({ color: 'red', message });
		}
	}, [event, updateStatus, onClose, onUpdated]);

	const handleGoToOrganization = useCallback(() => {
		if (!event?.organizationId) return;
		handleClose();
		router.push(`/crm/organization/${event.organizationId}`);
	}, [event, router]);

	const handleClose = useCallback(() => {
		setConfirmDelete(false);
		setEditing(false);
		onClose();
	}, [onClose]);

	const handleEditSaved = useCallback(() => {
		setEditing(false);
		onClose();
		onUpdated?.();
	}, [onClose, onUpdated]);

	if (!event) return null;

	const statusConfig = CalendarEventConst.Status?.[event.status as EnCalendarEventStatus];

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={editing ? 'Редактирование события' : 'Событие'}
			size={editing ? 'lg' : 'md'}
		>
			{editing ? (
				<CalendarEventForm
					event={event}
					assigneeId={event.assignee?.id}
					organizationId={event.organizationId}
					onSuccess={handleEditSaved}
					onCancel={() => setEditing(false)}
				/>
			) : (
				<Stack spacing="md">
					<Group position="apart">
						<Group spacing="xs">
							<Badge color={CalendarEventConst.Type[event.type as EnCalendarEventType]?.color || 'gray'}>
								{CalendarEventConst.Type[event.type as EnCalendarEventType]?.label || event.type}
							</Badge>
							{event.isAllDay && <Badge color="gray">Весь день</Badge>}
						</Group>
						{statusConfig && !isActive && (
							<Badge color={statusConfig.color}>
								{statusConfig.label}
							</Badge>
						)}
					</Group>

					<Text size="xl" weight={600}>{event.title}</Text>

					{event.description && (
						<Text color="dimmed">{event.description}</Text>
					)}

					<Paper p="sm" withBorder>
						<Stack spacing="xs">
							<Group spacing="xs">
								<Text size="sm" color="dimmed">Начало:</Text>
								<Text size="sm">
									{format(new Date(event.dateStart), 'd MMMM yyyy, HH:mm', { locale: ru })}
								</Text>
							</Group>
							<Group spacing="xs">
								<Text size="sm" color="dimmed">Окончание:</Text>
								<Text size="sm">
									{format(new Date(event.dateEnd), 'd MMMM yyyy, HH:mm', { locale: ru })}
								</Text>
							</Group>
							{event.location && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Место:</Text>
									<Text size="sm">{event.location}</Text>
								</Group>
							)}
							{event.assignee && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Исполнитель:</Text>
									<Text size="sm">
										{event.assignee.lastName} {event.assignee.firstName}
									</Text>
								</Group>
							)}
							{event.organization && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Организация:</Text>
									<Text size="sm">
										{(event.organization as any).nameRu || (event.organization as any).nameEn || event.organization.name}
									</Text>
								</Group>
							)}
							{event.completedAt && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">
										{event.status === EnCalendarEventStatus.Cancelled ? 'Отменено:' : 'Завершено:'}
									</Text>
									<Text size="sm">
										{format(new Date(event.completedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
									</Text>
								</Group>
							)}
							{event.participants && event.participants.length > 0 && (
								<Group spacing="xs" align="flex-start">
									<Text size="sm" color="dimmed">Участники:</Text>
									<Stack spacing={4}>
										{event.participants.map((p: any) => (
											<Text key={p.id} size="sm">
												{p.user?.lastName} {p.user?.firstName}
												{p.status === 'accepted' && ' ✓'}
												{p.status === 'declined' && ' ✗'}
											</Text>
										))}
									</Stack>
								</Group>
							)}
						</Stack>
					</Paper>

					{confirmDelete ? (
						<Paper p="sm" withBorder style={{ backgroundColor: '#fff5f5' }}>
							<Stack spacing="xs">
								<Text size="sm" weight={500}>Вы уверены, что хотите удалить это событие?</Text>
								<Group position="right">
									<Button variant="outline" size="xs" onClick={() => setConfirmDelete(false)}>
										Назад
									</Button>
									<Button color="red" size="xs" onClick={handleDelete}>
										Удалить
									</Button>
								</Group>
							</Stack>
						</Paper>
					) : (
						<Stack spacing="sm">
							{/* Кнопки Готово / Отмена события — только для активных событий */}
							{isActive && canModify && (
								<Group position="center" grow>
									<Button
										color="green"
										variant="light"
										onClick={handleComplete}
									>
										Готово
									</Button>
									<Button
										color="gray"
										variant="light"
										onClick={handleCancel}
									>
										Отмена
									</Button>
								</Group>
							)}

							{/* Для завершённых/отменённых — кнопка возврата в активные */}
							{!isActive && canModify && (
								<Group position="center">
									<Button
										color="blue"
										variant="light"
										onClick={handleReactivate}
									>
										Вернуть в активные
									</Button>
								</Group>
							)}

							<Group position="right">
								{isAuthor && (
									<Button color="red" variant="subtle" onClick={() => setConfirmDelete(true)}>
										Удалить
									</Button>
								)}
								{event.organizationId && (
									<Button variant="light" onClick={handleGoToOrganization}>
										Перейти к организации
									</Button>
								)}
								<Button variant="outline" onClick={handleClose}>
									Закрыть
								</Button>
								{canModify && isActive && (
									<Button
										onClick={() => setEditing(true)}
										style={{
											backgroundColor: '#228be6',
											color: '#fff',
											border: 'none',
											transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
										}}
										onMouseEnter={(e: any) => {
											e.currentTarget.style.backgroundColor = '#1565c0';
											e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 101, 192, 0.4)';
										}}
										onMouseLeave={(e: any) => {
											e.currentTarget.style.backgroundColor = '#228be6';
											e.currentTarget.style.boxShadow = 'none';
										}}
									>
										Редактировать
									</Button>
								)}
							</Group>
						</Stack>
					)}
				</Stack>
			)}
		</Modal>
	);
};
