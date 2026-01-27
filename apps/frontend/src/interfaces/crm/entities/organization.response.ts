import { CrmContactResponse, CrmPhoneResponse } from '@interfaces/crm';
import {
	CrmEmailResponse,
	CrmOrganizationRequisiteResponse,
	CrmOrganizationTagResponse,
	CrmOrganizationTypeResponse,
} from '@interfaces/crm';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface CrmOrganizationResponse {
	id: number;
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	// -------
	user?: IUserResponse;
	userId?: number;
	type?: CrmOrganizationTypeResponse;
	typeId?: number;
	requisites?: CrmOrganizationRequisiteResponse[];
	contacts?: CrmContactResponse[];
	phones?: CrmPhoneResponse[];
	emails?: CrmEmailResponse[];
	tags?: CrmOrganizationTagResponse[];
	// -------
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
	createdAt: string;
	updatedAt: string;
}
