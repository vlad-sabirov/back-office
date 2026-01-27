import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface IDeleteModalProps {
	onDelete: (val: IRequisiteSliceFormEntity) => void;
}
