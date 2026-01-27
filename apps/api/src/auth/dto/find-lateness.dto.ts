import { PrismaWhere, CombiningType } from '../../helpers';

export interface FindLatenessDto extends PrismaWhere<FindLatenessDto> {
	id?: CombiningType<number | string>;
	userId?: number | string;
	type?: string;
	comment?: string;
	isSkipped?: boolean;
	metaInfo?: string;
	createdAt?: CombiningType<string | Date>;
}
