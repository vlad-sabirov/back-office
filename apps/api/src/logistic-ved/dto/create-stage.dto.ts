import { IsAlpha, IsNumber, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateStageLogisticVedDto {
	@IsString()
	@Length(4, 64)
	name: string;

	@IsString()
	@MinLength(12)
	description: string;

	@IsAlpha()
	@Length(4, 64)
	alias: string;

	@IsNumber()
	warningTime: number;

	@IsNumber()
	errorTime: number;

	@IsOptional()
	@IsNumber()
	actionExpectedId?: number;

	@IsOptional()
	@IsNumber()
	position?: number;
}
