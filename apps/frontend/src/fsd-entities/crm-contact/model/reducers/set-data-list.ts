import { WritableDraft } from 'immer/dist/internal';
import { PayloadAction } from '@reduxjs/toolkit';
import { ICrmContactApiList } from '../service.types';
import { ICrmContactReducer } from '../slice.types';

export const setDataList = (
	state: WritableDraft<ICrmContactReducer>,
	action: PayloadAction<ICrmContactApiList>
): void => {
	state.data.list = action.payload.data;
	state.count.total = action.payload.total;
	state.count.all = action.payload.all || 0;
	state.count.full = action.payload.full || 0;
	state.count.medium = action.payload.medium || 0;
	state.count.low = action.payload.low || 0;
	state.count.empty = action.payload.empty || 0;
};
