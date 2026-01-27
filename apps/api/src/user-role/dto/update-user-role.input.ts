import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UserRoleEntity } from '../entities/user-role.entity';

export class UpdateUserRoleInput {
	@IsOptional()
	@ValidateNested()
	@Type(() => UserRoleEntity)
	roleDto?: UserRoleEntity;
}
