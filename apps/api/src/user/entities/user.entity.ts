import { Type } from 'class-transformer';
import { LatenessEntity } from 'src/auth/entity/lateness.entity';
import { LatenessEntityGrouped } from 'src/auth/entity/lateness.entity';
import { UserDepartmentEntity } from 'src/user-department/entity/user-department.entity';
import { UserRoleEntity } from 'src/user-role/entities/user-role.entity';
import { UserTerritoryEntity } from 'src/user-territory/entity/user-territory.entity';

export class UserEntity {
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

	@Type(() => UserEntity)
	child?: UserEntity[];
	parent?: UserEntity;

	@Type(() => UserDepartmentEntity)
	department?: UserDepartmentEntity;
	departmentId?: number;

	@Type(() => UserTerritoryEntity)
	territory?: UserTerritoryEntity;
	territoryId?: number;

	@Type(() => UserRoleEntity)
	roles?: UserRoleEntity[];

	@Type(() => UserRoleEntity)
	lateness?: LatenessEntity[] | LatenessEntityGrouped;
}
