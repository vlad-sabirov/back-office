import { ICrmRealizationGetDataAll, ICrmRealizationGetDataTeam } from '@fsd/widgets/crm-realization-analytics';

export interface IPercentChartProps {
	data: ICrmRealizationGetDataAll | ICrmRealizationGetDataTeam | undefined;
}
