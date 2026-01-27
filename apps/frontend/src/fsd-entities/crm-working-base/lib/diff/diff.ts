import { IUseDiffRes } from './diff.types';
import { IWorkingBaseRes } from '../../api/res';
import { IWorkingBaseUserRes } from '../../api/res/working-base.res';

export const diff = (
	curr: IWorkingBaseRes | IWorkingBaseUserRes | null,
	prev: IWorkingBaseRes | IWorkingBaseUserRes | null
): IUseDiffRes | null => {
	if (!curr || !prev) {
		return null;
	}

	return {
		total: curr.total - prev.total,
		totalPercent: getPercent(curr.total, prev.total),
		active: curr.active - prev.active,
		activePercent: getPercent(curr.active, prev.active),
		medium: curr.medium - prev.medium,
		mediumPercent: getPercent(curr.medium, prev.medium),
		low: curr.low - prev.low,
		lowPercent: getPercent(curr.low, prev.low),
		empty: curr.empty - prev.empty,
		emptyPercent: getPercent(curr.empty, prev.empty),
	};
};

const getPercent = (a: number, b: number): number => {
	return Math.round(((a * 100) / b) * 10) / 10 - 100;
};
