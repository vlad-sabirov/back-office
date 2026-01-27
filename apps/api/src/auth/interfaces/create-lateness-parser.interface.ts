export interface ICreateLatenessParser {
	userId: number;
	type: string;
	comment?: string;
	isSkipped: boolean;
	metaInfo: string;
	createdAt: Date;
}
