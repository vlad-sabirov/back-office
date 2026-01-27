import { ICrmEmailCreateEntity } from '../../crm-email';
import { ICrmPhoneCreateEntity } from '../../crm-phone';
import { ICrmOrganizationEntity } from '../entity';

export interface ICrmOrganizationApiList {
	data: ICrmOrganizationEntity[];
	total: number;
	all?: number;
	full?: number;
	medium?: number;
	low?: number;
	empty?: number;
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

export interface IServiceCreate {
	nameRu: string;
	nameEn: string;
	firstDocument: string;
	website?: string;
	comment?: string;
	color?: string;
	userId?: number | string;
	typeId?: number | string;
	isVerified: boolean;
	isReserve: boolean;
	isArchive: boolean;
}

type IServiceUpdateDto = { [key in keyof IServiceCreate]?: IServiceCreate[key] };
export interface IServiceUpdate {
	id: string | number;
	updateDto: IServiceUpdateDto;
	phonesDto?: ICrmPhoneCreateEntity[];
	emailsDto?: ICrmEmailCreateEntity[];
	tagsDto?: (string | number)[];
}

export interface IServiceConnectContacts {
	organizationId: string | number;
	contactIds: (string | number)[];
}

export interface IServiceConnectTags {
	organizationId: string | number;
	tagIds: (string | number)[];
}
