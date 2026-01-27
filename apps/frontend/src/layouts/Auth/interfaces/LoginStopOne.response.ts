import { IUserResponse } from '@interfaces/user/UserList.response';

export interface LoginStepOneResponse extends IUserResponse {
	pinCode: number;
}
