import { IsNumber } from 'class-validator';

export class ResortDepartmentDto {
	@IsNumber()
	id: number;

	@IsNumber()
	position: number;
}
