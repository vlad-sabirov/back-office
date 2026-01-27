import { IStaffEntity } from "@fsd/entities/staff";

export interface IStaffDepartmentEntity {
	id?: number;

	name: string;
	address: string;

	staffCount?: number;
	staffMaleCount?: number;
	staffFemaleCount?: number;
	position?: number;
	isHide?: boolean;

	parent?: IStaffDepartmentEntity;
	child?: IStaffDepartmentEntity[];
	users?: IStaffEntity[];

	createdAt?: Date;
	updatedAt?: Date;
}
