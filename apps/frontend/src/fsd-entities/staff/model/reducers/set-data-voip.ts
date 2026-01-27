import { WritableDraft } from 'immer/dist/internal';
import { PayloadAction } from '@reduxjs/toolkit';
import { IStaffReducer, IStaffVoip } from '../staff.types';

export const setDataVoip = (
	state: WritableDraft<IStaffReducer>,
	action: PayloadAction<Record<string, IStaffVoip>>
): void => {
	state.data.voip = action.payload;
};
