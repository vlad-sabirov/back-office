export interface UpdateLatenessCommentRequest {
	type?: string;
	comment?: string;
	userId?: number | string;
	latenessId?: number | string;
}
