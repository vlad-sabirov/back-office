import { IUserAllInfoResponse } from '@interfaces/user/UserAllInfo.response';
import { IStaffDepartmentResponse, IStaffTerritoryResponse } from '@screens/staff';

export interface IUseUser {
	user: IUserAllInfoResponse | null;
	userId: number | null;
	team: number[] | null;
	parent: number | null;
	children: number[] | null;

	department: IStaffDepartmentResponse | null;
	territory: IStaffTerritoryResponse | null;

	rolesAlias: string[] | null;
}
