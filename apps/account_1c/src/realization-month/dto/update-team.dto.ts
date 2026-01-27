import { RealizationMonthTeamModel } from '../models/realization-month-team.model';

export type IUpdateTeamDto = {
	userId: number | string;
	year: number | string;
	month: number | string;
	data: Partial<RealizationMonthTeamModel>;
};
