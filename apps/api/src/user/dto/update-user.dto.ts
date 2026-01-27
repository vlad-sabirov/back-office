import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { UserConstants } from '../user.constants';

export class UpdateUserDto {
	@IsOptional()
	@Length(4, 64, { message: UserConstants.ERROR_USERNAME_LENGTH })
	@IsString()
	username?: string;

	@IsOptional()
	@Length(8, 64, { message: UserConstants.ERROR_PASSWORD_LENGTH })
	@IsString()
	password?: string;

	@IsOptional()
	@Length(2, 64, { message: UserConstants.ERROR_FIRST_NAME_LENGTH })
	@IsString()
	firstName?: string;

	@IsOptional()
	@Length(2, 64, { message: UserConstants.ERROR_LAST_NAME_LENGTH })
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	surName?: string;

	@IsOptional()
	@Length(4, 64, { message: UserConstants.ERROR_WORK_POSITION_LENGTH })
	@IsString()
	workPosition?: string;

	@IsOptional()
	@IsDateString()
	birthday?: Date;

	@IsOptional()
	@IsString()
	sex?: string;

	@IsOptional()
	@IsString()
	photo?: string;

	@IsOptional()
	@IsString()
	color?: string;

	@IsOptional()
	@IsString()
	telegramId?: string;

	@IsOptional()
	@IsString()
	phoneVoip?: string;

	@IsOptional()
	@IsString()
	phoneMobile?: string;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	@IsString()
	telegram?: string;

	@IsOptional()
	@IsString()
	facebook?: string;

	@IsOptional()
	@IsString()
	instagram?: string;

	@IsOptional()
	@IsBoolean()
	isFixLate?: boolean;

	@IsOptional()
	@IsBoolean()
	isFired?: boolean;

	@IsOptional()
	@IsNumber()
	position?: number;
}
