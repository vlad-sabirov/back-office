import { ButtonProps } from "@fsd/shared/ui-kit";
import { ReactNode } from "react";

export interface ISearchHeaderProps extends Omit<ButtonProps, 'children'> {
	children?: ReactNode;
}
