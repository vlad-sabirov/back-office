import { UserEntity } from '../../user/entities/user.entity';

import {
	ContactEntity,
	EmailEntity,
	HistoryEntity,
	OrganizationRequisiteEntity,
	OrganizationTagEntity,
	OrganizationTypeEntity,
	PhoneEntity,
} from '.';

export type OrganizationEntity = {
	id: number;
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	color?: string;
	// -------
	user?: UserEntity;
	userId?: number;
	type?: OrganizationTypeEntity;
	typeId?: number;
	// -------
	requisites?: OrganizationRequisiteEntity[];
	contacts?: ContactEntity[];
	phones?: PhoneEntity[];
	emails?: EmailEntity[];
	tags?: OrganizationTagEntity[];
	history?: HistoryEntity[];
	last1CUpdate?: Date;
	// -------
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	createdAt: Date;
	updatedAt: Date;
};
