import { FC, useCallback, useEffect, useState } from 'react';
import { ICalendarEventEntity, CalendarEventService } from '@fsd/entities/calendar-event';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { Modal, Button, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import css from './event-delete-modal.module.scss';

interface IProps {
	event: ICalendarEventEntity;
	opened: boolean;
	onClose: () => void;
}

export const EventDeleteModal: FC<IProps> = ({ event, opened, onClose }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const historyActions = useCrmHistoryActions();

	const [deleteEvent, { ...deleteProps }] = CalendarEventService.delete();

	const onConfirm = useCallback(async () => {
		await deleteEvent(event.id);
	}, [deleteEvent, event.id]);

	useEffect(() => {
		if (deleteProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(deleteProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteProps.status]);

	useEffect(() => {
		if (deleteProps.error) {
			showNotification({ color: 'red', message: 'Ошибка удаления события' });
		}
	}, [deleteProps.error, deleteProps.startedTimeStamp]);

	useEffect(() => {
		if (deleteProps.isSuccess) {
			showNotification({ color: 'green', message: 'Событие удалено' });
			historyActions.reloadTimestamp();
			onClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteProps.fulfilledTimeStamp, deleteProps.isSuccess]);

	return (
		<Modal opened={opened} onClose={onClose} title="Удаление события" loading={isLoading} size={450}>
			<div className={css.content}>
				<TextField className={css.message}>
					Вы уверены, что хотите удалить событие?
				</TextField>
				<TextField className={css.eventTitle}>
					&quot;{event.title}&quot;
				</TextField>
			</div>

			<Modal.Buttons>
				<Button color="neutral" onClick={onClose} disabled={isLoading}>
					Отмена
				</Button>
				<Button color="error" onClick={onConfirm} disabled={isLoading}>
					Удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
