import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface FindLatenessRequest extends PrismaWhereRequest<FindLatenessRequest> {
	id?: CombiningType<number | string>;
	userId?: number | string;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: CombiningType<string>;
}
