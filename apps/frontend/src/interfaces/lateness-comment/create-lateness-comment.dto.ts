export interface CreateLatenessCommentRequest {
	type: string;
	comment: string;
	userId: number | string;
	latenessId: number | string;
}
