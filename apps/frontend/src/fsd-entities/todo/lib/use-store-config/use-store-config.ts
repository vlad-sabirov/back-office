import { useEffect } from 'react';
import { TodoService } from '@fsd/entities/todo';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { useActions } from '../';

export const useStoreConfig = () => {
	const lastUpdateDataMy = useStateSelector((state) => state.todo.updateData.my);
	const [getTasksByUserId] = TodoService.getTasksByUserID();
	const actions = useActions();

	const { userId } = useUser();

	useEffect(() => {
		let isMounted = true;
		(async () => {
			actions.setIsLoading(true);
			const response = await getTasksByUserId({
				user_id: userId ?? 0,
				order: [{ field: 'due_date', direction: 'desc' }],
			});
			if (isMounted && response?.data?.data) {
				actions.setDataMy(response.data.data);
			}
			actions.setIsLoading(false);
		})();
		return () => {
			isMounted = false;
		};
	}, [actions, getTasksByUserId, lastUpdateDataMy, userId]);
};
