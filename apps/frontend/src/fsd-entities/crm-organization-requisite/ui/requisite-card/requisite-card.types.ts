import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface IRequisiteCardProps {
	data: IRequisiteSliceFormEntity[];
	onCreate?: (val: IRequisiteSliceFormEntity) => void;
	onDelete?: (val: IRequisiteSliceFormEntity) => void;
	onUpdate?: (val: IRequisiteSliceFormEntity) => void;
	required?: boolean;
}
