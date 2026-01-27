import { CombiningType, PrismaWhereRequest } from '@helpers/interfaces';

export interface FindVacationRequest extends PrismaWhereRequest<FindVacationRequest> {
	userId?: number | string;
	dateStart?: CombiningType<string | Date>;
	dateEnd?: CombiningType<string | Date>;
	comment?: string;
	isFake?: boolean;
	[key: string]: unknown;
}
