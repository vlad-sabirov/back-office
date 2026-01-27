import { DetailedHTMLProps, FormHTMLAttributes } from 'react';

export type RequisiteAddSuccessT = {
	index: string;
	name: string;
	inn: string;
	code1c: string;
};

export type RequisiteAddFormT = {
	index: string;
	name: string;
	inn: string;
	code1c: string;
};

export type RequisiteAddModalT = {
	opened: boolean;
	setOpened: (val: boolean) => void;
	onSuccess: (res: RequisiteAddSuccessT) => void;
	hasData?: RequisiteAddFormT[];
} & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
