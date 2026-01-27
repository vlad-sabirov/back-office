import { IRolesResponse } from './Roles.response';
import { IUserResponse } from './UserList.response';
import { IStaffDepartmentResponse, IStaffTerritoryResponse } from '@screens/staff';

export interface IUserAllInfoResponse {
	id: number;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	surName: string;
	workPosition: string;
	birthday: Date;
	sex: string;
	photo: string;
	color: string;
	telegramId: string;
	phoneVoip: string;
	phoneMobile: string;
	email: string;
	telegram: string;
	facebook: string;
	instagram: string;
	isFixLate: boolean;
	isFired: boolean;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	lastLogin: Date;
	isFirstLogin: boolean;

	parent?: IUserResponse;
	parentId?: number;
	children?: IUserResponse[];
	childrenId?: number[];
	team?: number[];

	roles?: IRolesResponse[];
	rolesAlias?: string[];

	department?: IStaffDepartmentResponse;
	departmentId?: number;

	territory?: IStaffTerritoryResponse;
	territoryId?: number;
}
