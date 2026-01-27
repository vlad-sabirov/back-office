import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmPhoneRequest extends PrismaWhereRequest<QueryCrmPhoneRequest> {
	id?: CombiningType<number | string>;
	type?: CombiningType<'organization' | 'contact'>;
	value?: CombiningType<string>;
	comment?: CombiningType<string>;
	organizationId?: CombiningType<number | string>;
	contactId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
