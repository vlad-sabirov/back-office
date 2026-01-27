import { IsString, Length } from 'class-validator';

export class CreateOrderLogisticVedDto {
	@IsString()
	@Length(4, 64)
	name: string;

	authorId: number;
}
