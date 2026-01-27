import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryHistoryDto extends PrismaWhere<QueryHistoryDto> {
	id?: CombiningType<number | string>;
	type?: CombiningType<string>;
	payload?: CombiningType<string>;
	isSystem?: boolean;
	userId?: CombiningType<number | string>;
	organizationId?: CombiningType<number | string>;
	contactId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryHistoryParsed extends PrismaWhere<QueryHistoryParsed> {
	id?: CombiningType<number>;
	type?: CombiningType<string>;
	payload?: CombiningType<string>;
	isSystem?: boolean;
	userId?: CombiningType<number>;
	organizationId?: CombiningType<number>;
	contactId?: CombiningType<number>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
