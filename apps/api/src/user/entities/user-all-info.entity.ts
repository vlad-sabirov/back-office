import { UserDepartmentEntity } from 'src/user-department/entity/user-department.entity';
import { UserRoleEntity } from 'src/user-role/entities/user-role.entity';
import { UserTerritoryEntity } from 'src/user-territory/entity/user-territory.entity';
import { UserEntity } from './user.entity';

export class UserAllInfoEntity {
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
	child?: UserEntity[];

	parent?: UserEntity;
	parentId?: number;
	children?: UserEntity[];
	childrenId?: number[];
	team?: number[];

	roles?: UserRoleEntity[];
	rolesAlias?: string[];

	department?: UserDepartmentEntity;
	departmentId?: number;

	territory?: UserTerritoryEntity;
	territoryId?: number;
}
