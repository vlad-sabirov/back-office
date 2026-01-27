export interface UpdateLatenessRequest {
	userId?: number | string;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: string;
}
