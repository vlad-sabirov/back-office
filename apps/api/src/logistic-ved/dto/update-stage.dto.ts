import { IsAlpha, IsBoolean, IsNumber, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateStageLogisticVedDto {
	@IsOptional()
	@IsString()
	@Length(4, 64)
	name?: string;

	@IsOptional()
	@IsString()
	@MinLength(12)
	description?: string;

	@IsOptional()
	@IsAlpha()
	@Length(4, 64)
	alias?: string;

	@IsOptional()
	@IsNumber()
	warningTime?: number;

	@IsOptional()
	@IsNumber()
	errorTime?: number;

	@IsOptional()
	@IsNumber()
	orderCount?: number;

	@IsOptional()
	@IsNumber()
	position?: number;

	@IsOptional()
	@IsBoolean()
	isHide?: boolean;

	@IsOptional()
	@IsNumber()
	actionExpectedId?: number;

	@IsOptional()
	@IsString()
	updatedAt?: Date;
}
