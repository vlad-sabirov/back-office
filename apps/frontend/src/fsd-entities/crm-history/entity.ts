import { ICrmContactEntity } from '@fsd/entities/crm-contact';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { IStaffEntity } from '@fsd/entities/staff';

export enum EnCrmHistoryTypes {
	Comment = 'comment',
	Log = 'log',
	Call = 'call',
	Task = 'task',
}

export enum EnCrmHistoryEntities {
	Organization = 'organization',
	Contact = 'contact',
}

export type ICrmHistoryEntity = {
	id: number;
	isSystem: boolean;
	// -------
	user?: IStaffEntity;
	userId?: number;
	organization?: ICrmOrganizationEntity;
	organizationId?: number;
	contact?: ICrmContactEntity;
	contactId?: number;
	commentId?: number;
	// -------
	createdAt: string;
	updatedAt: string;
} & (
	| {
			type: EnCrmHistoryTypes.Log;
			payload: string;
	  }
	| {
			type: EnCrmHistoryTypes.Comment;
			payload: string;
	  }
	| {
			type: EnCrmHistoryTypes.Call;
			payload: ICrmHistoryPayloadCall;
	  }
);

export interface ICrmHistoryPayloadCall {
	call_id: string;
	call_mark: string;
	call_type: string;
	caller: string;
	did: string;
	duration: number;
	file: string;
	is_answered: boolean;
	is_checked: boolean;
	queue: string;
	receiver: string;
	timestamp: string;
	stages: ICrmHistoryPayloadCall[];
	uuid: string;
}
