import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface IRequisiteItemsProps {
	data: IRequisiteSliceFormEntity[];
	isDelete: boolean;
	isEdit: boolean;
}
