import { ICrmEmailCreateEntity } from '@fsd/entities/crm-email';
import { ICrmPhoneCreateEntity } from '@fsd/entities/crm-phone';
import { ICrmContactEntity } from '../entity';

export interface ICrmContactApiList {
	data: ICrmContactEntity[];
	total: number;
	all: number;
	full?: number;
	medium?: number;
	low?: number;
	empty?: number;
}

export interface ICrmContactApiAdd {
	name: string;
	workPosition: string;
	birthday: Date | string;
	comment?: string;
	userId?: number | string;
	isVerified: boolean;
	isArchive: boolean;
}

export interface ICrmContactApiEdit {
	id: number | string;
	updateDto?: {
		name?: string;
		workPosition?: string;
		birthday?: Date | string;
		comment?: string;
		userId?: number | string;
		isVerified?: boolean;
		isArchive?: boolean;
	};
	phonesDto?: ICrmPhoneCreateEntity[];
	emailsDto?: ICrmEmailCreateEntity[];
}

export interface IApiConnectOrganizationDto {
	contactId: string | number;
	organizationIds?: (string | number)[];
}

export interface IApiFind {
	search?: string;
	where?: {
		userIds?: number[];
		updatedAt?: {
			start: string;
			end: string;
		};
		isArchive?: boolean;
	};
	sort?: {
		take?: number;
		skip?: number;
	};
	ignore?: {
		ids?: number[];
		userIds?: number[];
	};
}
