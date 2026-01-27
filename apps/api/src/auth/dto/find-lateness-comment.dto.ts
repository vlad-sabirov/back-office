import { CombiningType, PrismaWhere } from '../../helpers';

export interface FindLatenessCommentDto extends PrismaWhere<FindLatenessCommentDto> {
	id?: CombiningType<number | string>;
	type?: string;
	comment?: string;
	userId?: number | string;
	latenessId?: number | string;
	createdAt?: CombiningType<string | Date>;
}
