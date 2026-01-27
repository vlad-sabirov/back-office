export class UserDepartmentEntity {
	id?: number;

	name: string;
	staffCount?: number;
	staffMaleCount?: number;
	staffFemaleCount?: number;
	position?: number;

	child?: UserDepartmentEntity[];
	parent?: number;

	isHide?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
