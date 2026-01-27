import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryOrganizationTypeDto extends PrismaWhere<QueryOrganizationTypeDto> {
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryOrganizationTypeParsed extends PrismaWhere<QueryOrganizationTypeParsed> {
	id?: CombiningType<number>;
	name?: CombiningType<string>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
