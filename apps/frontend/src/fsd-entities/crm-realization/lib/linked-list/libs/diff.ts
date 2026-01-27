import { getPercent } from './get-percent';
import { IData, ILinkedListAllValue, ILinkedListEmployeeValue, ILinkedListTeamValue } from '../types.linked-list';

export const diff = (
	currentNode: ILinkedListAllValue | ILinkedListTeamValue | ILinkedListEmployeeValue | null,
	diffNode: ILinkedListAllValue | ILinkedListTeamValue | ILinkedListEmployeeValue | null
): IData => {
	if (!currentNode?.data || !diffNode?.data) {
		return null;
	}

	return {
		plan: getPercent(currentNode.data.plan, diffNode.data.plan),
		realization: getPercent(currentNode.data.realization, diffNode.data.realization),
		customerCount: getPercent(currentNode.data.customerCount, diffNode.data.customerCount),
		customerShipment: getPercent(currentNode.data.customerShipment, diffNode.data.customerShipment),
		shipmentCount: getPercent(currentNode.data.shipmentCount, diffNode.data.shipmentCount),
		percent: getPercent(currentNode.data.percent, diffNode.data.percent),
		depthOfSales:
			Math.round(((currentNode?.data?.depthOfSales ?? 0) - (diffNode?.data?.depthOfSales ?? 0)) * 10) / 10,
		averageOrderValue: getPercent(currentNode.data.averageOrderValue, diffNode.data.averageOrderValue),
		workingBasePercent: getPercent(currentNode.data.workingBasePercent, diffNode.data.workingBasePercent),
	};
};
