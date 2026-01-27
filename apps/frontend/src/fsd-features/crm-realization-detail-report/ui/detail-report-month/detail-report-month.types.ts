import {
	ICrmRealizationLinkedListAllValue,
	ICrmRealizationLinkedListEmployeeValue,
	ICrmRealizationLinkedListTeamValue,
} from '@fsd/entities/crm-realization';

export interface IDetailReportProps {
	data:
		| ICrmRealizationLinkedListAllValue
		| ICrmRealizationLinkedListTeamValue
		| ICrmRealizationLinkedListEmployeeValue
		| null;
	title?: string;
	displayChart?: boolean;
	withDiff?: boolean;

	displayRealization?: boolean;
	displayCustomerCount?: boolean;
	displayCustomerShipments?: boolean;
	displayShipmentsCount?: boolean;
	displayDepthOfSales?: boolean;
	displayAverageOrderValue?: boolean;
	displayWorkingBasePercent?: boolean;
}
