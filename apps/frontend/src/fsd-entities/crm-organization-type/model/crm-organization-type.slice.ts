import { createSlice } from "@reduxjs/toolkit";
import { CrmOrganizationTypeConst as Const } from "../const/crm-organization-type.const";
import { ICrmOrganizationTypeReducer } from "../types/crm-organization-type.reducer";
import * as reducers from "./reducers";

const initialState: ICrmOrganizationTypeReducer = {
	data: {
		list: [],
		current: null,
	},
	modals: {
		list: false,
		create: false,
		update: false,
		delete: false,
	},
	status: {},
	errors: {},
}

const crmOrganizationTypeSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setDataCurrent: reducers.setDataCurrent,
		setDataList: reducers.setDataList,
		setModalShow: reducers.setModalShow,
		setStatusCurrent: reducers.setStatusCurrent,
		setStatusList: reducers.setStatusList,
	}
});

export const CrmOrganizationTypeReducer = crmOrganizationTypeSlice.reducer
export const CrmOrganizationTypeActions = crmOrganizationTypeSlice.actions
