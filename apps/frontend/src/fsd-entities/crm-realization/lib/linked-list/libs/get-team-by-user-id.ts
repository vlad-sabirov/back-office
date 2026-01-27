import { IMonthResTeam } from '../../../api/res';
import { ILinkedListAllValue, IToArrayOptions } from '../types.linked-list';

export const getTeamByUserId = (
	node: ILinkedListAllValue | null,
	userId: number,
	options?: IToArrayOptions
): IMonthResTeam[] => {
	const output: IMonthResTeam[] = [];
	while (node) {
		const foundReport = node.downToTeams.linkedList[userId];
		if (foundReport) {
			output.push(foundReport.data);
		}
		node = node.next;
	}
	return options?.reverse ? output.reverse() : output;
};
