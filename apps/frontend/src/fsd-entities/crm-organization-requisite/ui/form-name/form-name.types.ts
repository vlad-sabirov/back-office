import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";

export interface IFormNameProps {
	data: IRequisiteSliceFormEntity[];
	ignoreData?: IRequisiteSliceFormEntity[];
	value: string;
	error: string | undefined;
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	required?: boolean;
}
