import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface FindLatenessCommentRequest extends PrismaWhereRequest<FindLatenessCommentRequest> {
	id?: CombiningType<number | string>;
	type?: string;
	comment?: string;
	userId?: number | string;
	latenessId?: number | string;
	createdAt?: CombiningType<string>;
}
