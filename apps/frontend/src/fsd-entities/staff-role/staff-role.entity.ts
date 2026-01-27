import { IStaffEntity } from "@fsd/entities/staff";

export interface IStaffRoleEntity {
	id: number;
	alias: string;
	description: string;
	users?: IStaffEntity[];
	createdAt: Date;
	updatedAt: Date;
}
