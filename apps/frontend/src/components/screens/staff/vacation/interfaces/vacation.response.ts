import { IUserResponse } from '@interfaces/user/UserList.response';

export interface VacationResponse {
	id: number;
	comment?: string;
	dateStart: string;
	dateEnd: string;
	isFake: boolean;
	// -------
	userId: number;
	user?: IUserResponse;
	// -------
	createdAt: Date;
	updatedAt: Date;
}
