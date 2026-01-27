import { IUserResponse } from '@interfaces/user/UserList.response';

export interface LoginStepTwoResponse extends Omit<IUserResponse, 'lateness'> {
	pinCode: number;
	isFix: boolean;
	lateness: boolean;
}
