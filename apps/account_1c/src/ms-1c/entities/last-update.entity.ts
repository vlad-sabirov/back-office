export interface ILastUpdateEntity {
	code: number;
	status: string;
	data: {
		type: string;
		timestamp: string;
	}[];
}
