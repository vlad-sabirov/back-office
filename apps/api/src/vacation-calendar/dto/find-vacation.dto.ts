import { PrismaWhere, CombiningType } from '../../helpers';

export interface FindVacationDto extends PrismaWhere<FindVacationDto> {
	userId?: number | string;
	dateStart?: CombiningType<string | Date>;
	dateEnd?: CombiningType<string | Date>;
	comment?: string;
	isFake?: boolean;
}
