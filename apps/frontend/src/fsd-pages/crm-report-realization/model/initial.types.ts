export interface IInitialState {
	isFetching: boolean;
	modals: IInitialStateModals;
	forms: {
		planCreate: IInitialStateFormPlanCreate;
		planUpdate: IInitialStateFormPlanCreate;
	};
	errors: {
		planCreate: IInitialStateErrorPlanCreate;
		planUpdate: IInitialStateErrorPlanCreate;
	};
}

export interface IInitialStateModals {
	planList: boolean;
	planCreate: boolean;
	planUpdate: boolean;
	planRemove: boolean;
}

type IFormEmployees = Omit<IFormTeams, 'staffIds' | 'employees'>;

export type IFormTeams = {
	userId?: number;
	plan?: number;
	planCustomerCount?: number;
	planWorkingBasePercent?: number;
	staffIds?: number[];
	employees?: Record<number, IFormEmployees> | null;
};

export type IInitialStateFormPlanCreate = {
	year?: string;
	month?: string;
	teams?: Record<number, IFormTeams>;
};

export type IInitialStateErrorPlanCreate = {
	date?: string;
	teams?: Record<string, string>;
	employees?: Record<string, string>;
};

export type IInitialStateFormPlanUpdate = {
	year?: string;
	month?: string;
	teams?: Record<number, IFormTeams>;
};

export type IInitialStateErrorPlanUpdate = {
	date?: string;
	teams?: Record<string, string>;
	employees?: Record<string, string>;
};
