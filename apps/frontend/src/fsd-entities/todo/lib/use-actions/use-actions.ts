import { useStateActions } from '@fsd/shared/lib/hooks';
import { TodoSliceActions } from '../../model/todo.slice';

export const useActions = () => useStateActions(TodoSliceActions);
