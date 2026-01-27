import { LatenessCommentResponse } from '@interfaces';
import { IUserResponse } from '@interfaces/user/UserList.response';

interface Item {
	id: number;
	type: 'arrived' | 'late' | 'didCome';
	dateISO: string;
	date: string;
	time: string;
	comment: string;
	metaInfo: string;
	isSkipped: boolean;
	comments?: LatenessCommentResponse[];
	userId?: number;
}

interface Calculate {
	workingMinutes: number;
	lateMinutes: number;
	latePercent: number;
	arrivedDays: number;
	lateDays: number;
	didComeDays: number;
}

export type LatenessDataResponse = {
	user: IUserResponse;
	data: Item[];
	calculate?: Calculate;
};
