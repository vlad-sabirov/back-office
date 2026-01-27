import { ReportRealizationResponse } from '@interfaces/crm';
import { FilterPeriodType } from '@screens/crm/reports/realization';

export interface LineChartProps {
	data: ReportRealizationResponse[];
	displayCalculate?: boolean;
	clickEvent?: boolean;
	className?: string;
	displayType?: FilterPeriodType;
}
