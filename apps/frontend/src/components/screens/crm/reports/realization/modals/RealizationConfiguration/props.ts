import { ReportRealizationResponse } from '@interfaces';

export interface RealizationConfigurationProps {
	current: ReportRealizationResponse | null;
	opened: boolean;
	setOpened: (value: boolean) => void;
}
