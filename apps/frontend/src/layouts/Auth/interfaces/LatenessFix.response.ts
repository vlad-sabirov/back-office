export interface LatenessFixResponse {
	userId: number;
	type?: 'in' | 'out';
	comment?: string;
	metaInfo?: string;
}
