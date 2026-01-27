import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryOrganizationRequisiteDto extends PrismaWhere<QueryOrganizationRequisiteDto> {
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	inn?: CombiningType<number | string>;
	organizationId?: CombiningType<number | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryOrganizationRequisiteParsed extends PrismaWhere<QueryOrganizationRequisiteParsed> {
	id?: CombiningType<number>;
	name?: CombiningType<string>;
	inn?: CombiningType<number>;
	organizationId?: CombiningType<number>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
