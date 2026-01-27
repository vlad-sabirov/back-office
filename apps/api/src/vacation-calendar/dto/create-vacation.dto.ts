export class CreateVacationDto {
	userId: number;
	dateStart: string;
	dateEnd: string;
	comment?: string;
	isFake: boolean;
}
