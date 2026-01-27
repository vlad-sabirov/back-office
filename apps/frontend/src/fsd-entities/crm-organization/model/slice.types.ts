import { FetchStatus } from '@fsd/shared/lib/fetch-status';
import { ICrmOrganizationEntity } from '../entity';

const Entities = ['list', 'current'] as const;

export interface ICrmOrganizationReducer {
	data: {
		list: ICrmOrganizationEntity[];
		current: ICrmOrganizationEntity | null;
		voip: Record<string, ICrmOrganizationVoip>;
		all: Record<string | number, ICrmOrganizationEntity>;
	};
	count: {
		total: number;
		all: number;
		full: number;
		medium: number;
		low: number;
		empty: number;
		unverified: number;
	};
	filter: {
		list: ICrmOrganizationReducerFilterList;
		dateOfNew: {
			year: string;
			month: string;
		};
	};
	modals: ICrmOrganizationReducerModals;
	status: Partial<Record<(typeof Entities)[number], (typeof FetchStatus)[number]>>;
	errors: Partial<Record<(typeof Entities)[number], string | null>>;
}

export interface ICrmOrganizationReducerFilterList {
	limit?: number | string;
	page?: number | string;
	isVerified?: boolean;
	isArchive?: boolean;
	userIds?: number[] | string[] | undefined;
	ignoreUserIds?: number[] | string[] | undefined;
	updatedAt?: { start: string; end: string };
	createdAt?: { start: string; end: string };
	last1CUpdate?: { start: string | null; end: string | null };
	tags?: string[];
	search?: string;
}

export interface ICrmOrganizationReducerModals {
	create: boolean;
}

export interface ICrmOrganizationVoip {
	id: string;
	name: string;
	phone: string[];
}
