import { IMonthResTeam } from './month-team.res';

export interface IMonthRes {
	year: number;
	month: number;
	plan?: number;
	planCustomerCount?: number;
	planWorkingBasePercent?: number;
	realization?: number;
	customerCount?: number;
	customerShipment?: number;
	shipmentCount?: number;
	percent?: number;
	depthOfSales?: number;
	averageOrderValue?: number;
	workingBasePercent?: number;
	teams?: IMonthResTeam[];
}
