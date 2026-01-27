import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IStaffEntity } from "../../staff.entity";
import { IStaffReducer } from "../staff.types";

export const setDataSales = (
	state: WritableDraft<IStaffReducer>,
	action: PayloadAction<IStaffEntity[]>
): void => {
	state.data.sales = action.payload;
}
