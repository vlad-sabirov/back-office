import { LatenessResponse } from '@interfaces/lateness';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface LatenessCommentResponse {
	id: number;
	type: string;
	comment: string;
	user?: IUserResponse;
	userId: number;
	lateness?: LatenessResponse;
	latenessId: number;
	createdAt: string;
}
