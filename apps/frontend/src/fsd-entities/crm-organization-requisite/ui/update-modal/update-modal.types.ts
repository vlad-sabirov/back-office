import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface IUpdateModalProps {
	data: IRequisiteSliceFormEntity[];
	onUpdate: (val: IRequisiteSliceFormEntity) => void;
}

export type IUpdateModalChangeForm = [keyof IRequisiteSliceFormEntity, string];
export type IUpdateModalChangeError = [keyof IRequisiteSliceFormEntity, string | undefined];
