import { CombiningType, PrismaFilterRequest, PrismaWhereRequest } from '@helpers/interfaces';
import { ICrmOrganizationEntity } from '../../entity';

export interface IFindRequest extends PrismaWhereRequest<IFindRequest> {
	where: IFindRequestWhere;
	filter?: PrismaFilterRequest<
		Omit<
			ICrmOrganizationEntity,
			'user' | 'type' | 'tags' | 'requisites' | 'contacts' | 'phones' | 'emails' | 'comments' | 'history'
		>
	>;
	include?: Record<string, boolean>;
	search?: string;
	power?: { medium: number; low: number; empty: number };
}

interface IFindRequestWhere {
	id?: CombiningType<number | string>;
	nameRu?: CombiningType<string>;
	nameEn?: CombiningType<string>;
	firstDocument?: CombiningType<string>;
	website?: CombiningType<string>;
	comment?: CombiningType<string>;
	color?: CombiningType<'red' | 'green' | 'yellow' | 'purple'>;
	userId?: CombiningType<number | string>;
	typeId?: CombiningType<number | string>;
	tags?: string[];
	isVerified?: boolean;
	isReserve?: boolean;
	isArchive?: boolean;
	last1CUpdate?: CombiningType<Date | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}
