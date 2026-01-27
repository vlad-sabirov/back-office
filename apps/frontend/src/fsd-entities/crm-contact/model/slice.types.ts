import { ICrmEmailFormEntity } from '@fsd/entities/crm-email';
import { ICrmOrganizationFormEntity } from '@fsd/entities/crm-organization';
import { ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';
import { FetchStatus } from '@fsd/shared/lib/fetch-status';
import { ICrmContactEntity } from '../entity';

const Entities = ['list', 'current'] as const;

export interface ICrmContactReducer {
	data: {
		list: ICrmContactEntity[];
		current: ICrmContactEntity | null;
		voip: Record<string, ICrmContactVoip>;
		all: Record<string | number, ICrmContactEntity>;
	};
	forms: {
		create: IAddContactForm;
		update: IEditContactForm;
	};
	count: {
		all: number;
		total: number;
		full: number;
		medium: number;
		low: number;
		empty: number;
	};
	filter: {
		list: ICrmContactReducerFilterList;
	};
	modals: ICrmContactReducerModals;
	status: Partial<Record<(typeof Entities)[number], (typeof FetchStatus)[number]>>;
	errors: Partial<Record<(typeof Entities)[number], string | null>>;
}

export interface ICrmContactReducerFilterList {
	limit?: number | string;
	page?: number | string;
	userIds?: number[] | string[];
	updatedAt?: { start: string; end: string };
	search?: string;
}

export interface ICrmContactReducerModals {
	search: boolean;
	update: boolean;
	delete: boolean;
}

export interface IAddContactForm {
	values: {
		name: string;
		userId: string;
		workPosition: string;
		birthday: string;
		comment: string;
		phones: ICrmPhoneFormEntity[];
		emails: ICrmEmailFormEntity[];
		organizations: ICrmOrganizationFormEntity[];
	};
	errors?: Partial<Record<keyof IAddContactForm['values'], string>>;
}

export interface IEditContactForm {
	values: {
		name: string;
		userId: string;
		workPosition: string;
		birthday: string;
		comment: string;
		phones: ICrmPhoneFormEntity[];
		emails: ICrmEmailFormEntity[];
	};
	errors?: Partial<Record<keyof IAddContactForm['values'], string>>;
}

export interface ICrmContactVoip {
	id: string;
	name: string;
	phone: string[];
}
