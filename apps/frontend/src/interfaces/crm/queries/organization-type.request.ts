import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmOrganizationTypeRequest
	extends PrismaWhereRequest<QueryCrmOrganizationTypeRequest>
{
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
