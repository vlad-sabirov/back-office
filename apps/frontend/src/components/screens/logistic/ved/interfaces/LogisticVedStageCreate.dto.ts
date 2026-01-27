export interface ILogisticVedStageCreateDto {
	name: string;
	description: string;
	alias: string;
	warningTime: number;
	errorTime: number;
	actionExpectedId?: number;
	position?: number;
}
