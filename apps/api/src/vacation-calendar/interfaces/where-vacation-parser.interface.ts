import { PrismaWhere, CombiningType } from '../../helpers';

export interface IWhereVacationParser extends PrismaWhere<IWhereVacationParser> {
	userId?: number;
	dateStart?: CombiningType<Date>;
	dateEnd?: CombiningType<Date>;
	comment?: string;
}
