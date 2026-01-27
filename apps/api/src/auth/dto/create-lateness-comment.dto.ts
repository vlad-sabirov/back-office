import { CombiningType } from 'src/helpers';

export class CreateLatenessCommentDto {
	type: string;
	comment: string;
	userId: number | string;
	latenessId: number | string;
	createdAt: CombiningType<string | Date>;
}
