import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface ICreateModalProps {
	data: IRequisiteSliceFormEntity[];
	onCreate: (val: IRequisiteSliceFormEntity) => void;
}

export type ICreateModalChangeForm = [keyof IRequisiteSliceFormEntity, string];
export type ICreateModalChangeError = [keyof IRequisiteSliceFormEntity, string | undefined];
