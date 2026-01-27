import { PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { IStaffEntity } from "../../staff.entity";
import { IStaffReducer } from "../staff.types";

export const setDataAll = (
	state: WritableDraft<IStaffReducer>,
	action: PayloadAction<IStaffEntity[]>
): void => {
	state.data.all = action.payload;
}
