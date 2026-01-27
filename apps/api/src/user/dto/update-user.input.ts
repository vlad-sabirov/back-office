import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserInput {
	@ValidateNested()
	@IsOptional()
	@Type(() => UpdateUserDto)
	userDto?: UpdateUserDto;

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
