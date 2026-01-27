import { useStateActions } from '@fsd/shared/lib/hooks';
import { VoipSliceActions } from '../../model/voip.slice';

export const useActions = () => useStateActions(VoipSliceActions);
