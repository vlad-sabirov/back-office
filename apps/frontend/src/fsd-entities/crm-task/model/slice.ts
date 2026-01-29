import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Const } from '../config/const';
import { ICrmTaskEntity, ICrmTaskFormEntity, EnCrmTaskStatus, EnCrmTaskPriority } from '../entity';

export interface ICrmTaskReducer {
	data: {
		list: ICrmTaskEntity[];
		current: ICrmTaskEntity | null;
		myTasks: ICrmTaskEntity[];
	};
	forms: {
		create: {
			values: ICrmTaskFormEntity;
			errors: Record<string, string>;
		};
	};
	filter: {
		list: {
			page: number;
			limit: number;
			status?: string[];
			priority?: string[];
			assigneeId?: number;
		};
	};
	modals: {
		create: boolean;
		edit: boolean;
		delete: boolean;
	};
	status: {
		list?: 'idle' | 'loading' | 'success' | 'error';
		current?: 'idle' | 'loading' | 'success' | 'error';
	};
}

const initialFormValues: ICrmTaskFormEntity = {
	title: '',
	description: '',
	status: EnCrmTaskStatus.Pending,
	priority: EnCrmTaskPriority.Normal,
	deadline: null,
	authorId: 0,
	assigneeId: 0,
	organizationId: null,
};

export const initialState: ICrmTaskReducer = {
	data: {
		list: [],
		current: null,
		myTasks: [],
	},
	forms: {
		create: {
			values: { ...initialFormValues },
			errors: {},
		},
	},
	filter: {
		list: { page: 1, limit: 25 },
	},
	modals: {
		create: false,
		edit: false,
		delete: false,
	},
	status: {},
};

const CrmTaskSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataList: (state, action: PayloadAction<ICrmTaskEntity[]>) => {
			state.data.list = action.payload;
		},
		setDataCurrent: (state, action: PayloadAction<ICrmTaskEntity | null>) => {
			state.data.current = action.payload;
		},
		setDataMyTasks: (state, action: PayloadAction<ICrmTaskEntity[]>) => {
			state.data.myTasks = action.payload;
		},
		setFormCreateField: (state, action: PayloadAction<{ field: keyof ICrmTaskFormEntity; value: any }>) => {
			(state.forms.create.values as any)[action.payload.field] = action.payload.value;
		},
		setFormCreateReset: (state) => {
			state.forms.create.values = { ...initialFormValues };
			state.forms.create.errors = {};
		},
		setFormCreateErrors: (state, action: PayloadAction<Record<string, string>>) => {
			state.forms.create.errors = action.payload;
		},
		setFilterList: (state, action: PayloadAction<Partial<ICrmTaskReducer['filter']['list']>>) => {
			state.filter.list = { ...state.filter.list, ...action.payload };
		},
		setModalShow: (state, action: PayloadAction<{ modal: keyof ICrmTaskReducer['modals']; show: boolean }>) => {
			state.modals[action.payload.modal] = action.payload.show;
		},
		setStatusList: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
			state.status.list = action.payload;
		},
		setStatusCurrent: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
			state.status.current = action.payload;
		},
	},
});

export const CrmTaskReducer = CrmTaskSlice.reducer;
export const CrmTaskActions = CrmTaskSlice.actions;
