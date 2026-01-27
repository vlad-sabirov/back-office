import { FetchStatus } from "@fsd/shared/lib/fetch-status";
import { ICrmOrganizationTypeEntity } from "./crm-organization-type.entity";

const Entities = ['list', 'current'] as const;

export interface ICrmOrganizationTypeReducer {
	data: {
		list: ICrmOrganizationTypeEntity[];
		current: ICrmOrganizationTypeEntity | null;
	};
	modals: ICrmOrganizationTypeReducerModals;
	status: Partial<Record<typeof Entities[number], typeof FetchStatus[number]>>;
	errors: Partial<Record<typeof Entities[number], string | null>>;
}

export interface ICrmOrganizationTypeReducerModals {
	list: boolean;
	create: boolean;
	update: boolean;
	delete: boolean;
}
