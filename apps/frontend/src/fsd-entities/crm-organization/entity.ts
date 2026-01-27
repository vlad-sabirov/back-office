import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { ICrmEmailFormEntity } from '@fsd/entities/crm-email';
import { ICrmHistoryEntity } from '@fsd/entities/crm-history';
import { ICrmOrganizationRequisiteEntity } from '@fsd/entities/crm-organization-requisite';
import { ICrmOrganizationRequisiteFormEntity } from '@fsd/entities/crm-organization-requisite';
import { ICrmOrganizationTagEntity } from '@fsd/entities/crm-organization-tag';
import { ICrmOrganizationTypeEntity } from '@fsd/entities/crm-organization-type';
import { ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';
import { IStaffEntity } from '@fsd/entities/staff';

export interface ICrmOrganizationEntity {
	id: number;
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | undefined;
	// -------
	user?: IStaffEntity;
	userId?: number;
	type?: ICrmOrganizationTypeEntity;
	typeId?: number;
	requisites?: ICrmOrganizationRequisiteEntity[];
	contacts?: ICrmContactEntity[];
	phones?: ICrmPhoneFormEntity[];
	emails?: ICrmEmailFormEntity[];
	tags?: ICrmOrganizationTagEntity[];
	history?: ICrmHistoryEntity[];
	last1CUpdate: string;
	// -------
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	createdAt: string;
	updatedAt: string;
	lastUpdate1C?: string;
}

export interface ICrmOrganizationFormEntity {
	type: 'connected';
	id: string;
	nameEn: string;
	nameRu: string;
	website?: string;
	comment?: string;
	userId?: string;
	typeId?: string;
	phones?: ICrmPhoneFormEntity[];
	emails?: ICrmEmailFormEntity[];
	requisites?: ICrmOrganizationRequisiteFormEntity[];
}
