import { ITodoInitialStateData, ITodoInitialStateModals } from './todo-slice-init.types';
import { ITodoInitialStateFormsCreate } from './todo-slice-init.types';
import { initialState } from './todo-slice.init';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
	name: 'voip',
	initialState,
	reducers: {
		setIsLoading: (state, { payload }: PayloadAction<boolean>) => {
			state.isLoading = payload;
		},
		setIsFetching: (state, { payload }: PayloadAction<boolean>) => {
			state.isFetching = payload;
		},
		setDataMy(state, { payload }: PayloadAction<ITodoInitialStateData['my']>) {
			if (payload == null) {
				return;
			}
			state.data.my = payload;
		},
		setDataCurrent(state, { payload }: PayloadAction<ITodoInitialStateData['current']>) {
			if (payload == null) {
				return;
			}
			state.data.current = payload;
		},
		updateData: (state, { payload }: PayloadAction<keyof ITodoInitialStateData>) => {
			state.updateData[payload] = new Date().getMilliseconds();
		},
		setModalShow: (state, { payload }: PayloadAction<{ modal: keyof ITodoInitialStateModals; show: boolean }>) => {
			state.modals[payload.modal] = payload.show;
		},
		setFormCreate(state, { payload }: PayloadAction<Partial<ITodoInitialStateFormsCreate>>) {
			state.forms.create = { ...state.forms.create, ...payload };
		},
		setFormErrorCreate(
			state,
			{ payload }: PayloadAction<Partial<Record<keyof ITodoInitialStateFormsCreate, string>>>
		) {
			state.formErrors.create = { ...initialState.formErrors.create, ...payload };
		},
		clearFormCreate(state) {
			state.forms.create = initialState.forms.create;
			state.formErrors.create = initialState.formErrors.create;
		},
		clearFormErrorsCreate(state) {
			state.formErrors.create = initialState.formErrors.create;
		},
	},
});

export const TodoSliceReducer = todoSlice.reducer;
export const TodoSliceActions = todoSlice.actions;
