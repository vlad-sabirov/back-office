import { PrismaWhere, CombiningType } from '../../helpers';

export interface IWhereLatenessParser extends PrismaWhere<IWhereLatenessParser> {
	id?: CombiningType<number>;
	userId?: number;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: CombiningType<Date>;
}
