import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryEmailDto extends PrismaWhere<QueryEmailDto> {
	id?: CombiningType<number | string>;
	type?: CombiningType<string>;
	value?: CombiningType<string>;
	comment?: CombiningType<string>;
	organizationId?: CombiningType<number | string>;
	contactId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryEmailParsed extends PrismaWhere<QueryEmailParsed> {
	id?: CombiningType<number>;
	type?: CombiningType<string>;
	value?: CombiningType<string>;
	comment?: CombiningType<string>;
	organizationId?: CombiningType<number>;
	contactId?: CombiningType<number>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
