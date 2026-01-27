import { ISliceInitialState } from './org-card-info.slice.types';
import * as Reducers from './reducers';
import { createSlice } from '@reduxjs/toolkit';
import { Const } from '../config/const';

export const initialState: ISliceInitialState = {
	isLoading: false,
	isShowModals: {
		add: false,
		disconnect: false,
	},
	find: {
		form: { name: '', phone: '', inn: '' },
		data: [],
		status: 'form',
	},
	disconnect: {
		currentId: null,
	},
};

const Slice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDisconnectCurrentId: Reducers.setDisconnectCurrentId,
		setFindData: Reducers.setFindData,
		setFindForm: Reducers.setFindForm,
		setFindStatus: Reducers.setFindStatus,
		setIsLoading: Reducers.setIsLoading,
		setShowModal: Reducers.setShowModal,
	},
});

export const Reducer = Slice.reducer;
export const Actions = Slice.actions;
