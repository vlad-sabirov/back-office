export interface ICreateVacationParser {
	userId: number;
	dateStart: Date;
	dateEnd: Date;
	comment?: string;
}
