import { RealizationMonthEmployeeModel } from '../models/realization-month-employee.model';

export type IUpdateEmployeeDto = {
	userId: number | string;
	year: number | string;
	month: number | string;
	data: Partial<RealizationMonthEmployeeModel>;
};
