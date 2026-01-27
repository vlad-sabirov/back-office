export interface IAnalyticsResponse {
	count_answered: number;
	count_missed: number;
	duration: number;
	answered: IAnalyticsItemWithStage[];
	missed: IAnalyticsItemWithStage[];
}

export interface IAnalyticsItem {
	call_id: string;
	call_mark: string;
	call_type: string;
	caller: string;
	did: string;
	duration: number;
	file: string;
	queue: string;
	receiver: string;
	timestamp: 'string';
	uuid: 'string';
}

export interface IAnalyticsItemWithStage extends IAnalyticsItem {
	stages: IAnalyticsItem[];
}
