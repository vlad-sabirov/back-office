import { FC, useCallback, useEffect, useState } from 'react';
import { ICrmTaskEntity, CrmTaskService } from '@fsd/entities/crm-task';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { Modal, Button, TextField } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import css from './task-delete-modal.module.scss';

interface IProps {
	task: ICrmTaskEntity;
	opened: boolean;
	onClose: () => void;
}

export const TaskDeleteModal: FC<IProps> = ({ task, opened, onClose }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const historyActions = useCrmHistoryActions();

	const [deleteTask, { ...deleteProps }] = CrmTaskService.delete();

	const onConfirm = useCallback(async () => {
		await deleteTask(task.id);
	}, [deleteTask, task.id]);

	useEffect(() => {
		if (deleteProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(deleteProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteProps.status]);

	useEffect(() => {
		if (deleteProps.error) {
			showNotification({ color: 'red', message: 'Ошибка удаления задачи' });
		}
	}, [deleteProps.error, deleteProps.startedTimeStamp]);

	useEffect(() => {
		if (deleteProps.isSuccess) {
			showNotification({ color: 'green', message: 'Задача удалена' });
			historyActions.reloadTimestamp();
			onClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteProps.fulfilledTimeStamp, deleteProps.isSuccess]);

	return (
		<Modal opened={opened} onClose={onClose} title="Удаление задачи" loading={isLoading} size={450}>
			<div className={css.content}>
				<TextField className={css.message}>
					Вы уверены, что хотите удалить задачу?
				</TextField>
				<TextField className={css.taskTitle}>
					&quot;{task.title}&quot;
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
