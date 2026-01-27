import { ReportRealizationResponse } from '@interfaces';

export interface GaugeChartProps {
	data: ReportRealizationResponse[];
	displayCalculate?: boolean;
}

export interface GaugeChartColorProps {
	main: string;
	darken: string;
}
