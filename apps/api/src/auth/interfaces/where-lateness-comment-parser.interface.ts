import { PrismaWhere, CombiningType } from '../../helpers';

export interface IWhereLatenessCommentParser extends PrismaWhere<IWhereLatenessCommentParser> {
	id?: CombiningType<number>;
	userId?: number;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: CombiningType<Date>;
}
