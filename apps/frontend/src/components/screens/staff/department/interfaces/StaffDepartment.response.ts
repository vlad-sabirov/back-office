import { IUserResponse } from '@interfaces/user/UserList.response';

export interface IStaffDepartmentResponse {
	id?: number;

	name: string;
	address: string;

	staffCount?: number;
	staffMaleCount?: number;
	staffFemaleCount?: number;
	position?: number;
	isHide?: boolean;

	parent?: IStaffDepartmentResponse;
	child?: IStaffDepartmentResponse[];
	users?: IUserResponse[];

	createdAt?: Date;
	updatedAt?: Date;
}
