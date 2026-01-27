export interface ILogisticVedFileCreateDto {
	file: File;
	type: string;
	url?: string;
	comment?: string;
	orderId: number;
	authorId: number;
}
