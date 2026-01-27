import { IMonthResEmployee } from './month-employee.res';
import { IMonthRes } from './month.res';

export type IMonthResTeam = Omit<IMonthRes, 'teams'> & {
	userId: number;
	employees?: IMonthResEmployee[];
	staffIds?: number[];
};
