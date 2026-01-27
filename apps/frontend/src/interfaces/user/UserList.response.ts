import { IRolesResponse } from './Roles.response';
import { LatenessResponse, LatenessResponseGrouped } from '@interfaces/lateness';
import { IStaffDepartmentResponse, IStaffTerritoryResponse } from '@screens/staff';

interface IUserCall {
	callType: 'voip' | 'trunk';
	callTarget: IUserResponse | string;
}

export interface IUserResponse {
	id: number;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	surName: string;
	workPosition: string;
	birthday: string;
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
	lastLogin: string;
	createdAt: string;
	updatedAt: string;
	child?: IUserResponse[];
	parent?: IUserResponse;
	departmentId: number;
	department: IStaffDepartmentResponse;
	territoryId: number;
	territory: IStaffTerritoryResponse;
	roles: IRolesResponse[];
	call: IUserCall;
	isFirstLogin: boolean;
	lateness?: LatenessResponse[] | LatenessResponseGrouped[];
}
