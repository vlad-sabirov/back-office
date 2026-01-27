import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface QueryCrmOrganizationRequest
	extends PrismaWhereRequest<QueryCrmOrganizationRequest>
{
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	firstDocument?: CombiningType<string>;
	website?: CombiningType<string>;
	comment?: CombiningType<string>;
	userId?: CombiningType<number | string>;
	typeId?: CombiningType<number | string>;
	isVerified?: boolean;
	isReserve?: boolean;
	isArchive?: boolean;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
