import { useCallback } from 'react';
import { ITodoInitialStateFormsCreate, TodoService, useTodoActions } from '@fsd/entities/todo';
import { useUser } from '@fsd/shared/lib/hooks';
import { showNotification } from '@mantine/notifications';

export const useCreate = (form: ITodoInitialStateFormsCreate) => {
	const [createTaskFetch] = TodoService.createTask();
	const { userId } = useUser();
	const todoActions = useTodoActions();

	return useCallback(async (): Promise<boolean> => {
		if (!userId) {
			return false;
		}

		todoActions.setIsLoading(true);

		const response = await createTaskFetch({
			user_id: userId,
			name: form.name,
			description: form.description,
			due_date: form.dueDate,
			assignee_id: form.assigneeId,
			organization_id: form.organizationOrContact?.type === 'organization' ? form.organizationOrContact.id : 0,
			contact_id: form.organizationOrContact?.type === 'contact' ? form.organizationOrContact.id : 0,
			send_notification_to_telegram: form.sendNotificationToTelegram,
		});

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		if (response?.error?.data?.error) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			showNotification({ color: 'red', message: response?.error?.data?.error });
			return false;
		}

		showNotification({ color: 'green', message: 'Задача добавлена' });
		todoActions.setIsLoading(false);
		return true;
	}, [createTaskFetch, form, todoActions, userId]);
};
