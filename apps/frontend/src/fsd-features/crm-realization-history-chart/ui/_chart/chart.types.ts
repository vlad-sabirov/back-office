import {
	ICrmRealizationMonthResAll,
	ICrmRealizationMonthResEmployee,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';
import { IRealizationTypes } from '@fsd/entities/crm-realization/model/realization-slice-init.types';

export interface IHistoryChartProps {
	height: number;
	data:
		| Omit<ICrmRealizationMonthResAll, 'teams'>[]
		| Omit<ICrmRealizationMonthResTeam, 'employees'>[]
		| ICrmRealizationMonthResEmployee[]
		| null;
	className?: string;
	isHideCalc?: boolean;
	type?: (typeof IRealizationTypes)[number];
}

export interface chartData {
	date: Date;
	realization: number | undefined;
	plan: number | undefined;
	percent: number | undefined;
}
