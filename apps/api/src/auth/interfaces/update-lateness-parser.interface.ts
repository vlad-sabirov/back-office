export interface IUpdateLatenessParser {
	userId?: number;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: Date;
}
