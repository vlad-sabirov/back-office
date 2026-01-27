import { ICrmOrganizationEntity } from "@fsd/entities/crm-organization";

 export interface ISliceInitialState {
	isLoading: boolean;
	isShowModals: ISliceInitialStateModals;
	find: {
		form: ISliceInitialStateFormFind;
		data: ICrmOrganizationEntity[];
		status: ISliceInitialStateFindStatus;
	},
	disconnect: {
		currentId: string | number | null;
	}
}

export type ISliceInitialStateFindStatus = 'form' | 'connect';

export interface ISliceInitialStateModals {
	add: boolean;
	disconnect: boolean;
}
export interface ISliceInitialStateFormFind {
	name: string;
	phone: string;
	inn: string;
}
