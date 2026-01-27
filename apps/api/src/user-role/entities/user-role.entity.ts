import { Length } from 'class-validator';
import { UserRoleConstants } from '../user-role.constants';

export class UserRoleEntity {
	id?: number;

	@Length(3, 32, { message: UserRoleConstants.ERROR_ALIAS_LENGTH })
	alias: string;

	@Length(4, 256, { message: UserRoleConstants.ERROR_DESCRIPTION_LENGTH })
	description: string;

	createdAt?: Date;
	updatedAt?: Date;
}
