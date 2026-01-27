import { IsBoolean, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class UpdateOrderLogisticVedDto {
	@IsOptional()
	@IsString()
	@Length(4, 64)
	name?: string;

	@IsOptional()
	@IsBoolean()
	isModification?: boolean;

	@IsOptional()
	@IsBoolean()
	isDone?: boolean;

	@IsOptional()
	@IsBoolean()
	isClose?: boolean;

	@IsOptional()
	@IsNumber()
	position?: number;

	@IsOptional()
	@IsBoolean()
	isHide?: boolean;

	@IsOptional()
	@IsNumber()
	authorId?: number;

	@IsOptional()
	@IsNumber()
	performerId?: number;

	@IsOptional()
	@IsNumber()
	stageId?: number;

	@IsOptional()
	@IsString()
	fileOrder?: string;

	@IsOptional()
	@IsString()
	fileCalculate?: string;
}
