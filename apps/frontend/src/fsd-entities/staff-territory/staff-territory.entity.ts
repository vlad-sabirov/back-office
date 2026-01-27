import { IStaffEntity } from "@fsd/entities/staff";

export interface IStaffTerritoryEntity {
	id?: number;
	name: string;
	address: string;
	staffCount?: number;
	staffMaleCount?: number;
	staffFemaleCount?: number;
	position?: number;
	isHide?: boolean;
	users?: IStaffEntity[];
	createdAt?: Date;
	updatedAt?: Date;
}
