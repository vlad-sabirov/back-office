import { IStaffEntity } from '@fsd/entities/staff';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization/';
import { ICrmPhoneEntity, ICrmPhoneFormEntity } from "@fsd/entities/crm-phone";
import { ICrmEmailEntity, ICrmEmailFormEntity } from "@fsd/entities/crm-email";
import { ICrmHistoryEntity } from '@fsd/entities/crm-history';

export interface ICrmContactEntity {
	id: number | string;
	name: string;
	workPosition: string;
	birthday?: string;
	comment?: string;
	// -------
	user?: IStaffEntity;
	userId?: number;
	organizations?: ICrmOrganizationEntity[];
	phones?: ICrmPhoneEntity[];
	emails?: ICrmEmailEntity[];
	history?: ICrmHistoryEntity[];
	// -------
	isVerified: boolean;
	isArchive: boolean;
	createdAt: string;
	updatedAt: string;
}
export type ICrmContactFormEntity = Pick<ICrmContactEntity,
	| 'id'
	| 'name'
	| 'workPosition'
	| 'birthday'
	| 'comment'
	| 'userId'
> & {
	phones: ICrmPhoneFormEntity[];
	emails: ICrmEmailFormEntity[];
	type?: 'create' | 'connect';
};
