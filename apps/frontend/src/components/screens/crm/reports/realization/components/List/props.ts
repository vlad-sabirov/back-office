import { ReportRealizationResponse } from '@interfaces';
import { FilterPeriodType } from '@screens/crm/reports/realization';

export interface ListProps {
	data: ReportRealizationResponse[];
	oldData?: ReportRealizationResponse[];
	displayType?: FilterPeriodType;
}
