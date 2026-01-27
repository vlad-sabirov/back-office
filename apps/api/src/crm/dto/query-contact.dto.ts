import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryContactDto extends PrismaWhere<QueryContactDto> {
	id?: CombiningType<number | string>;
	name?: CombiningType<string>;
	workPosition?: CombiningType<string>;
	birthday?: CombiningType<Date | string>;
	email?: CombiningType<string>;
	comment?: CombiningType<string>;
	userId?: CombiningType<number | string>;
	isVerified?: boolean;
	isArchive?: boolean;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryContactParsed extends PrismaWhere<QueryContactParsed> {
	id?: CombiningType<number>;
	name?: CombiningType<string>;
	workPosition?: CombiningType<string>;
	birthday?: CombiningType<Date>;
	email?: CombiningType<string>;
	comment?: CombiningType<string>;
	userId?: CombiningType<number>;
	isVerified?: boolean;
	isArchive?: boolean;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
