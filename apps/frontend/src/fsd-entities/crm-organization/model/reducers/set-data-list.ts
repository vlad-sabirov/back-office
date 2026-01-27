import { WritableDraft } from 'immer/dist/internal';
import { PayloadAction } from '@reduxjs/toolkit';
import { ICrmOrganizationApiList } from '../service.types';
import { ICrmOrganizationReducer } from '../slice.types';

export const setDataList = (
	state: WritableDraft<ICrmOrganizationReducer>,
	action: PayloadAction<ICrmOrganizationApiList>
): void => {
	state.data.list = action.payload.data;
	state.count.total = action.payload.total;
	state.count.all = action.payload.all || 0;
	state.count.full = action.payload.full || 0;
	state.count.medium = action.payload.medium || 0;
	state.count.low = action.payload.low || 0;
	state.count.empty = action.payload.empty || 0;
};
