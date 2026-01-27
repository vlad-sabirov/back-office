import { showNotification } from '@mantine/notifications';
import { ITaskEntity } from '../../api/entities';
import { TodoService } from '../../api/todo-api';
import { useActions } from '../use-actions/use-actions';

export const useCheckTask = () => {
	const [fetchCheck] = TodoService.checkTaskByID();
	const todoActions = useActions();

	return async (task_id: string, is_checked: boolean): Promise<ITaskEntity | null> => {
		const resp = await fetchCheck({ task_id, is_checked });
		todoActions.setIsLoading(true);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		if (resp.data?.error && resp.data?.error.length > 0) {
			showNotification({
				color: 'red',
				title: 'Не удалось изменить статус задачи',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				message: resp.data?.error,
			});
			todoActions.setIsLoading(false);
			return null;
		}

		todoActions.updateData('my');
		todoActions.setIsLoading(false);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		return resp.data?.data ?? null;
	};
};
