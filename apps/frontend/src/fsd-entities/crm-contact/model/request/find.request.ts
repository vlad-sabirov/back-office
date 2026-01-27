import { CombiningType, PrismaFilterRequest, PrismaWhereRequest } from '@helpers/interfaces';
import { ICrmContactEntity } from '../../entity';

export interface IFindRequest extends PrismaWhereRequest<IFindRequest> {
	where: IFindRequestWhere;
	filter?: PrismaFilterRequest<
		Omit<ICrmContactEntity, 'user' | 'organizations' | 'phones' | 'emails' | 'comments' | 'history'>
	>;
	include?: Record<string, boolean>;
	search?: string;
	power?: { medium: number; low: number; empty: number };
}

interface IFindRequestWhere {
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
