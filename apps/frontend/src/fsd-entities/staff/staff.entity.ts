import { IStaffDepartmentEntity } from "@fsd/entities/staff-department";
import { IStaffTerritoryEntity } from "@fsd/entities/staff-territory";
import { IStaffRoleEntity } from "@fsd/entities/staff-role";
import { ICrmOrganizationEntity } from "@fsd/entities/crm-organization";
import { ICrmContactEntity } from "@fsd/entities/crm-contact";
import { ICrmHistoryEntity } from "@fsd/entities/crm-history";

export interface IStaffEntity {
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
	child?: IStaffEntity[];
	parent?: IStaffEntity;
	parentId?: number | null;
	departmentId: number;
	department: IStaffDepartmentEntity;
	territoryId: number;
	territory: IStaffTerritoryEntity;
	roles: IStaffRoleEntity[];
	isFirstLogin: boolean;
	// -------
	crmOrganizations: ICrmOrganizationEntity[];
	crmContacts: ICrmContactEntity[];
	crmHistory: ICrmHistoryEntity[];
	// -------
	createdAt: string;
	updatedAt: string;
	// -------
}
