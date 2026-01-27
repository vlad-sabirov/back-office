import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserDepartmentEntity } from '../entity/user-department.entity';

export class CreateUserDepartmentDto {
	@ValidateNested()
	@Type(() => UserDepartmentEntity)
	departmentDto: UserDepartmentEntity;
}
