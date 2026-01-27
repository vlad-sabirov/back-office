import { IUserResponse } from '@interfaces/user/UserList.response';

export interface ReportRealizationResponse {
	id: number;
	year: number;
	month: number;
	plan: number;
	realization: number;
	customerCount: number;
	customerShipment: number;
	shipmentCount: number;
	user?: IUserResponse;
	userId?: number;
	createdAt: Date;
	updatedAt: Date;
}
