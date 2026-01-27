import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmContactRequest extends PrismaWhereRequest<QueryCrmContactRequest> {
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	workPosition?: CombiningType<string>;
	birthday?: CombiningType<Date | string>;
	email?: CombiningType<string>;
	comment?: CombiningType<string>;
	userId?: CombiningType<number | string>;
	isVerified?: boolean;
	isArchive?: boolean;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
