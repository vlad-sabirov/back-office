import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmOrganizationTagRequest
	extends PrismaWhereRequest<QueryCrmOrganizationTagRequest>
{
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
