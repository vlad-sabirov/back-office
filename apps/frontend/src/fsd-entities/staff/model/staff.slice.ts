import * as reducers from './reducers';
import { IStaffReducer } from './staff.types';
import { createSlice } from '@reduxjs/toolkit';
import { Const } from '../const';

const initialState: IStaffReducer = {
	data: {
		team: [],
		sales: [],
		all: [],
		worked: [],
		voip: {},
	},
};

const staffSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataAll: reducers.setDataAll,
		setDataSales: reducers.setDataSales,
		setDataTeam: reducers.setDataTeam,
		setDataVoip: reducers.setDataVoip,
		setDataWorked: reducers.setDataWorked,
	},
});

export const StaffReducer = staffSlice.reducer;
export const StaffActions = staffSlice.actions;
