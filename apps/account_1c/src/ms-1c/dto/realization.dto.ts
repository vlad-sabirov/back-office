export interface IRealizationDto {
	date_start: string;
	date_end: string;
	team?: (number | string)[];
	employee?: (number | string)[];
	organization?: (number | string)[];
	customer?: (number | string)[];
}
