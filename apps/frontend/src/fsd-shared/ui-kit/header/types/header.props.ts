import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

export interface IHeaderProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
{
	title: string;
	contentLeft?: ReactNode;
	contentRight?: ReactNode;
	contentCenter?: ReactNode;
	loading?: boolean;
}
