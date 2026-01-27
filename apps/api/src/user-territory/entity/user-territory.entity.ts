import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { UserTerritoryConstants } from '../user-territory.constants';

export class UserTerritoryEntity {
	id?: number;

	@IsString({ message: UserTerritoryConstants.VALIDATION_NAME_TYPE })
	@MinLength(3, { message: UserTerritoryConstants.VALIDATION_NAME_LENGTH })
	name: string;

	@IsString({ message: UserTerritoryConstants.VALIDATION_ADDRESS_TYPE })
	@MinLength(4, { message: UserTerritoryConstants.VALIDATION_ADDRESS_LENGTH })
	address: string;

	@IsOptional()
	@IsNumber({}, { message: UserTerritoryConstants.VALIDATION_STAFF_COUNT_TYPE })
	staffCount?: number;

	@IsOptional()
	@IsNumber({}, { message: UserTerritoryConstants.VALIDATION_STAFF_COUNT_MALE_TYPE })
	staffMaleCount?: number;

	@IsOptional()
	@IsNumber({}, { message: UserTerritoryConstants.VALIDATION_STAFF_COUNT_FEMALE_TYPE })
	staffFemaleCount?: number;

	@IsOptional()
	@IsNumber({}, { message: UserTerritoryConstants.VALIDATION_POSITION_TYPE })
	position?: number;

	@IsOptional()
	@IsBoolean({ message: UserTerritoryConstants.VALIDATION_IS_HIDE_TYPE })
	isHide?: boolean;

	createdAt?: Date;
	updatedAt?: Date;
}
