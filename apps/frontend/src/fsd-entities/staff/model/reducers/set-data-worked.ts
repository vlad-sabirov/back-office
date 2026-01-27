import { WritableDraft } from 'immer/dist/internal';
import { PayloadAction } from '@reduxjs/toolkit';
import { IStaffEntity } from '../../staff.entity';
import { IStaffReducer } from '../staff.types';

export const setDataWorked = (state: WritableDraft<IStaffReducer>, action: PayloadAction<IStaffEntity[]>): void => {
	state.data.worked = action.payload;
};
