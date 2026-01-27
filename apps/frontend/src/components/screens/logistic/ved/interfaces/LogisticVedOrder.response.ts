import { IUserResponse } from '@interfaces/user/UserList.response';
import { ILogisticVedFileResponse } from '@screens/logistic';
import { ILogisticVedHistoryResponse } from '@screens/logistic';
import { ILogisticVedStageResponse } from '@screens/logistic';
import { ILogisticVedCommentResponse } from '@screens/logistic';

export interface ILogisticVedOrderResponse {
	id: number;
	name: string;
	fileOrder: string;
	fileCalculate?: string;
	file?: ILogisticVedFileResponse[];
	isModification: boolean;
	isDone: boolean;
	isClose: boolean;
	isHide: boolean;
	author: IUserResponse;
	authorId: number;
	performer?: IUserResponse;
	performerId?: number;
	stage: ILogisticVedStageResponse;
	stageId: number;
	comments?: ILogisticVedCommentResponse[];
	history?: ILogisticVedHistoryResponse[];
	createdAt: string;
	updatedAt: string;

	statusCode?: number;
	message?: number;
}
