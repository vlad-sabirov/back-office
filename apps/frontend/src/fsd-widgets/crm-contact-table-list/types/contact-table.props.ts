import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface IContactTableProps extends IDefault {
	loading: boolean;
}
type IDefault = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
