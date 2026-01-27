import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICrmOrganizationTagEntity } from "@fsd/entities/crm-organization-tag";
import { FetchStatus } from "@fsd/shared/lib/fetch-status";
import { Const } from "../../config/const";
import { initialState } from "./tag.init";
import { ITagReducerModals } from "./tag.types";

const tagSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataCurrent: (state, action: PayloadAction<ICrmOrganizationTagEntity | null>) => {
			state.data.current = action.payload;
		},
		setDataList: (state, action: PayloadAction<ICrmOrganizationTagEntity[]>) => {
			state.data.list = action.payload;
		},
		setModalShow: (state, action: PayloadAction<{
			modal: keyof ITagReducerModals,
			show: boolean
		}>) => {
			state.modals[action.payload.modal] = action.payload.show;
		},
		setStatusCurrent: (state, action: PayloadAction<typeof FetchStatus[number]>) => {
			state.status.current = action.payload;
		},
		setStatusList: (state, action: PayloadAction<typeof FetchStatus[number]>) => {
			state.status.list = action.payload;
		},
	}
});

export const TagReducer = tagSlice.reducer
export const TagActions = tagSlice.actions
