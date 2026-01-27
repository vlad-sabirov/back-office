import { IUserRoleResponse } from '@interfaces/user/UserRole.response';
import { ILogisticVedOrderResponse } from '@screens/logistic';

export interface ILogisticVedStageResponse {
	id: number;
	name: string;
	description: string;
	alias: string;
	warningTime: number;
	errorTime: number;
	orderCount: number;
	position: number;
	isHide: boolean;

	orders?: ILogisticVedOrderResponse[];
	actionExpected: IUserRoleResponse;
	actionExpectedId: number;

	createdAt: string;
	updatedAt: string;

	statusCode?: number;
	message?: number;
}
