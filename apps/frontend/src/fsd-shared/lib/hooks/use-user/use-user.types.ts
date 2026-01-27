import { IStaffEntity } from '@fsd/entities/staff';
import { IStaffDepartmentEntity } from '@fsd/entities/staff-department';
import { IStaffTerritoryEntity } from '@fsd/entities/staff-territory';

export interface IUseUserResponse {
	user: IStaffEntity | null;
	userId: number | null;
	name: string | null;
	fullName: string | null;

	department: IStaffDepartmentEntity | null;
	territory: IStaffTerritoryEntity | null;

	getRoles: () => string[] | null;
	getTeam: () => number[] | null;
	getParent: () => IStaffEntity | null;
	getChildren: () => IStaffEntity[] | null;
}
