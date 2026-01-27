import { ReportRealizationResponse } from '@interfaces';

export interface PartProps {
	current: ReportRealizationResponse | null;
	old: ReportRealizationResponse | null;
}
