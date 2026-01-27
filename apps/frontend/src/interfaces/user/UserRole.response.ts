import { IUserResponse } from './UserList.response';

export interface IUserRoleResponse {
	id: number;
	alias: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	users: IUserResponse[];
}
