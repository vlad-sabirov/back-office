import { LatenessCommentResponse } from '@interfaces';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface LatenessResponse {
	id?: number;
	user?: IUserResponse;
	userId: number;
	type: string;
	comment: string;
	isSkipped?: boolean;
	metaInfo: string;
	createdAt: string;
	comments?: LatenessCommentResponse[];
}

export class LatenessResponseGrouped {
	arrived?: LatenessResponseGroupedArrived[];
	lateness?: LatenessResponseGroupedLateness[];
	didCome?: LatenessResponseGroupedDidCome[];
}

interface LatenessResponseGroupedArrived {
	date: string;
	time: string;
	comment: string;
	metaInfo: string;
}

interface LatenessResponseGroupedLateness {
	date: string;
	time: string;
	latenessMinutes: number;
	comment: string;
	metaInfo: string;
}

interface LatenessResponseGroupedDidCome {
	date: string;
	comment: string;
	metaInfo: string;
}
