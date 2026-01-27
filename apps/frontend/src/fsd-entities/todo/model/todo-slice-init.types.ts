import { ITaskEntity } from '@fsd/entities/todo/api/entities';

export interface ITodoInitialState {
	isLoading: boolean;
	isFetching: boolean;
	data: ITodoInitialStateData;
	updateData: Partial<Record<keyof ITodoInitialStateData, number>>;
	modals: ITodoInitialStateModals;
	forms: ITodoInitialStateForms;
	formErrors: ITodoInitialStateFormErrors;
}

export interface ITodoInitialStateData {
	my: ITaskEntity[];
	current: ITaskEntity | null;
}

export interface ITodoInitialStateModals {
	create: boolean;
	info: boolean;
}

export interface ITodoInitialStateForms {
	create: ITodoInitialStateFormsCreate;
}

export interface ITodoInitialStateFormErrors {
	create: Record<keyof ITodoInitialStateFormsCreate, string>;
}

export interface ITodoInitialStateFormsCreate {
	name: string;
	dueDate: string;
	assigneeId: number;
	organizationOrContact: ITodoInitialStateFormsCreateSearchResponse | null;
	sendNotificationToTelegram: boolean;
	description: string;
}

export interface ITodoInitialStateFormsCreateSearchResponse {
	id: number;
	type: 'organization' | 'contact';
	name: string;
	description: string[];
	phones: string[];
}
