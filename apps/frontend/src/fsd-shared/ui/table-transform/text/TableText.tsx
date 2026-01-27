import { TextField, TextFiendPropsSize } from "@fsd/shared/ui-kit";
import { capitalize, lowerCase } from "lodash";
import { ReactNode } from "react";
import css from "./table-text.module.scss";

interface IExec {
	value: string,
	size?: typeof TextFiendPropsSize[number],
	transform?: 'capitalize' | 'lowerCase',
}
// eslint-disable-next-line no-unused-vars
type IResponse = (props: IExec) => { output: ReactNode, index: string }

export const useTableText = (
): IResponse => {
	return ({ value, size, transform }: IExec) => {
		if (!value) return { output: null, index: '' };

		const index = value;
		const output = (
			<TextField
				size={size}
				className={css.value}
			>
				{!transform && value}
				{transform === 'capitalize' && capitalize(value)}
				{transform === 'lowerCase' && lowerCase(value)}
			</TextField>
		);

		return { output, index };
	};
}
