import { FetchStatus } from "@fsd/shared/lib/fetch-status";
import { ITagEntity } from "../../tag.entity";

const Entities = ['list', 'current'] as const;

export interface ITagReducerInitialState {
	data: {
		list: ITagEntity[];
		current: ITagEntity | null;
	};
	modals: ITagReducerModals;
	status: Partial<Record<typeof Entities[number], typeof FetchStatus[number]>>;
	errors: Partial<Record<typeof Entities[number], string | null>>;
}

export interface ITagReducerModals {
	list: boolean;
	create: boolean;
	update: boolean;
	delete: boolean;
}
