export class FixLatenessDto {
	userId: number;
	type?: 'in' | 'out';
	comment?: string;
	metaInfo?: string;
}
