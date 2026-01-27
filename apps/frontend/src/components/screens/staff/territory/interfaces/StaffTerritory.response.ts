import { IUserResponse } from '@interfaces/user/UserList.response';

export interface IStaffTerritoryResponse {
	id?: number;

	name: string;
	address: string;

	staffCount?: number;
	staffMaleCount?: number;
	staffFemaleCount?: number;
	position?: number;
	isHide?: boolean;

	users?: IUserResponse[];

	createdAt?: Date;
	updatedAt?: Date;
}
