export interface ILogisticVedHistoryCreateDto {
	title: string;
	description: string;
	secret?: string;
	authorId: number;
	orderId: number;
}
