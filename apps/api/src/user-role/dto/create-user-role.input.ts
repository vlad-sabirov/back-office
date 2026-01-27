import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserRoleEntity } from '../entities/user-role.entity';

export class CreateUserRoleInput {
	@ValidateNested()
	@Type(() => UserRoleEntity)
	roleDto: UserRoleEntity;
}
