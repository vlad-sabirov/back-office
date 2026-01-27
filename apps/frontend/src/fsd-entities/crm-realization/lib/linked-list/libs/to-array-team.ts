import { IMonthResTeam } from '../../../api/res';
import { ILinkedListTeam } from '../types.linked-list';

export const toArrayTeam = (node: ILinkedListTeam | null): IMonthResTeam[] => {
	const output: IMonthResTeam[] = [];
	if (!node || !node?.linkedList) {
		return output;
	}
	Object.values(node.linkedList).forEach((node) => {
		output.push(node.data);
	});
	return output;
};
