import { UseFormReturnType } from "@mantine/form";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export interface ITypeMutationProps extends IDefault {}
type IDefault = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export interface IFormValues {
	name: string
}

// eslint-disable-next-line no-unused-vars
export type IForm = UseFormReturnType<IFormValues, (values: IFormValues) => IFormValues>
