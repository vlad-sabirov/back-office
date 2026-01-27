import { ICrmRealizationGetDataAll, ICrmRealizationGetDataTeam } from '@fsd/widgets/crm-realization-analytics';

export interface IDetailReportProps {
	currentData: ICrmRealizationGetDataAll | ICrmRealizationGetDataTeam | undefined;
	diffData: ICrmRealizationGetDataAll;
	title: string;
	displayChart?: boolean;
	withDiff?: boolean;

	displayRealization?: boolean;
	displayCustomerCount?: boolean;
	displayCustomerShipments?: boolean;
	displayShipmentsCount?: boolean;
	displayDepthOfSales?: boolean;
	displayAverageOrderValue?: boolean;
	displayWorkingBasePercent?: boolean;
	displayPercent?: boolean;
}
