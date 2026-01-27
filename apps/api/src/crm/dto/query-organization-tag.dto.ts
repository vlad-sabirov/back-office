import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryOrganizationTagDto extends PrismaWhere<QueryOrganizationTagDto> {
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryOrganizationTagParsed extends PrismaWhere<QueryOrganizationTagParsed> {
	id?: CombiningType<number>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
