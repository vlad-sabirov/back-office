import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface IOrganizationTableProps extends IDefault {
	loading: boolean;
}
type IDefault = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
