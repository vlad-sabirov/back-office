import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateUserInput {
	@ValidateNested()
	@Type(() => CreateUserDto)
	userDto: CreateUserDto;

	@IsOptional()
	@IsNumber()
	parentDto?: number;

	@IsOptional()
	@IsArray()
	roleDto?: number[];

	@IsOptional()
	@IsNumber()
	departmentDto?: number;

	@IsOptional()
	@IsNumber()
	territoryDto?: number;
}
