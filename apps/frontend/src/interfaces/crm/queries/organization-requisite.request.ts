import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmOrganizationRequisiteRequest
	extends PrismaWhereRequest<QueryCrmOrganizationRequisiteRequest>
{
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	inn?: CombiningType<number | string>;
	organizationId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
