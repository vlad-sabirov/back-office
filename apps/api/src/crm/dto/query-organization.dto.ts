import { CombiningType, PrismaWhere } from '../../helpers';

export interface QueryOrganizationDto extends PrismaWhere<QueryOrganizationDto> {
	id?: CombiningType<number | string>;
	nameRu?: CombiningType<string>;
	nameEn?: CombiningType<string>;
	firstDocument?: CombiningType<string>;
	website?: CombiningType<string>;
	comment?: CombiningType<string>;
	color?: CombiningType<'red' | 'green' | 'yellow' | 'purple'>;
	userId?: CombiningType<number | string>;
	typeId?: CombiningType<number | string>;
	tags?: string[];
	isVerified?: boolean;
	isReserve?: boolean;
	isArchive?: boolean;
	last1CUpdate?: CombiningType<Date | string>;
	createdAt?: CombiningType<Date | string>;
	updatedAt?: CombiningType<Date | string>;
}

export interface QueryOrganizationParsed extends PrismaWhere<QueryOrganizationParsed> {
	id?: CombiningType<number>;
	nameRu?: CombiningType<string>;
	nameEn?: CombiningType<string>;
	firstDocument?: CombiningType<string>;
	website?: CombiningType<string>;
	comment?: CombiningType<string>;
	color?: CombiningType<'red' | 'green' | 'yellow' | 'purple'>;
	userId?: CombiningType<number>;
	typeId?: CombiningType<number>;
	isVerified?: boolean;
	isReserve?: boolean;
	isArchive?: boolean;
	last1CUpdate?: CombiningType<Date>;
	createdAt?: CombiningType<Date>;
	updatedAt?: CombiningType<Date>;
}
