import { IMonthResTeam } from './month-team.res';

export type IMonthResEmployee = Omit<IMonthResTeam, 'employees'>;
