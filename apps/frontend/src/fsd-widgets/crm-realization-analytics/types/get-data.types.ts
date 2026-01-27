import { IStaffEntity } from '@fsd/entities/staff';

export interface IGetData {
	plan: number;
	realization: number;
	customerCount: number;
	customerShipment: number;
	shipmentCount: number;
	workingBasePercent: number;
	percent?: number;
	depthOfSales?: number;
	averageOrderValue?: number;
	teams: IGetDataTeam[];
}

export interface IGetDataTeam {
	userId: number;
	user?: IStaffEntity;
	plan: number;
	realization: number;
	customerCount: number;
	customerShipment: number;
	shipmentCount: number;
	workingBasePercent: number;
	percent?: number;
	depthOfSales?: number;
	averageOrderValue?: number;
	staffIds: number[];
	employees: IGetDataEmployee[];
}

export interface IGetDataEmployee {
	userId: number;
	user?: IStaffEntity;
	plan: number;
	realization: number;
	customerCount: number;
	customerShipment: number;
	shipmentCount: number;
	workingBasePercent: number;
	percent?: number;
	depthOfSales?: number;
	averageOrderValue?: number;
}
