export interface ILogisticVedStageUpdateDto {
	name: string;
	description: string;
	alias: string;
	warningTime: number;
	errorTime: number;
	actionExpectedId?: number;
}
