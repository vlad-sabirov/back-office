import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmEmailRequest extends PrismaWhereRequest<QueryCrmEmailRequest> {
	id?: CombiningType<number | string>;
	type?: CombiningType<string>;
	value?: CombiningType<string>;
	comment?: CombiningType<string>;
	organizationId?: CombiningType<number | string>;
	contactId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
