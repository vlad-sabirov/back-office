import { IMonthRes } from '../../../api/res';
import { ILinkedListAllValue } from '../types.linked-list';

export const toArrayAll = (
	first: ILinkedListAllValue | null,
	last: ILinkedListAllValue | null,
	options?: { reverse?: boolean }
): IMonthRes[] => {
	const output: IMonthRes[] = [];
	if (options?.reverse) {
		while (first) {
			const item = first.data;
			item.teams = first.downToTeams.toArray();
			output.push(item);
			first = first.next;
		}
	} else {
		while (last) {
			const item = last.data;
			item.teams = last.downToTeams.toArray();
			output.push(item);
			last = last.prev;
		}
	}
	return output;
};
