import { IUseDiffRes } from './use-diff.types';
import { IWorkingBaseRes } from '../../api/res';
import { IWorkingBaseUserRes } from '../../api/res/working-base.res';
import { diff } from '../diff/diff';

export const useDiff = (
	curr: IWorkingBaseRes | IWorkingBaseUserRes | null,
	prev: IWorkingBaseRes | IWorkingBaseUserRes | null
): IUseDiffRes | null => {
	if (!curr || !prev) {
		return null;
	}

	return diff(curr, prev);
};
