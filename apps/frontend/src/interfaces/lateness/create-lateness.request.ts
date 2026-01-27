export interface CreateLatenessRequest {
	userId: number | string;
	type: string;
	comment: string;
	isSkipped: boolean;
	metaInfo: string;
	createdAt: Date;
}
