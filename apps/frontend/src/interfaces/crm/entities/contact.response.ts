import { IUserResponse } from '@interfaces/user/UserList.response';

import {
	CrmOrganizationResponse,
	CrmPhoneResponse,
	CrmEmailResponse
} from '@interfaces/crm';

export type CrmContactResponse = {
	id: number;
	name: string;
	workPosition: string;
	birthday?: Date;
	comment?: string;
	// -------
	user?: IUserResponse;
	userId?: number;
	organizations?: CrmOrganizationResponse[];
	phones?: CrmPhoneResponse[];
	emails?: CrmEmailResponse[];
	// -------
	isVerified: boolean;
	isArchive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
