import { useStateActions } from '@fsd/shared/lib/hooks';
import { WorkingBaseSliceActions } from '../../model/working-base.slice';

export const useActions = () => useStateActions(WorkingBaseSliceActions);
