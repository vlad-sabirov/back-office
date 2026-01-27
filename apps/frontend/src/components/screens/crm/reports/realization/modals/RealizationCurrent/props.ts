import { ReportRealizationResponse } from '@interfaces';

export interface RealizationCurrentProps {
	current: ReportRealizationResponse | null;
	old: ReportRealizationResponse | null;
	open: boolean;
	setOpen: (value: boolean) => void;
}
