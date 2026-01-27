import { IUserResponse } from '@interfaces/user/UserList.response';
import { ILogisticVedOrderResponse } from '@screens/logistic';

export interface ILogisticVedCommentResponse {
	id: number;
	comment: string;
	isHide: boolean;
	author?: IUserResponse;
	authorId?: number;
	order?: ILogisticVedOrderResponse;
	orderId?: number;
	createdAt: string;
	updatedAt: string;

	statusCode?: number;
	message?: number;
}
