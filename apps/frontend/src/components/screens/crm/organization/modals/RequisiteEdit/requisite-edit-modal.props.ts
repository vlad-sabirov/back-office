import { DetailedHTMLProps, FormHTMLAttributes } from 'react';

export type RequisiteEditSuccessT = {
	index: string;
	name: string;
	inn: string;
	code1c: string;
};

export type RequisiteEditFormT = {
	index: string;
	name: string;
	inn: string;
	code1c: string;
};

export type RequisiteEditModalT = {
	current: RequisiteEditFormT | null;
	opened: boolean;
	setOpened: (val: boolean) => void;
	onSuccess: (res: RequisiteEditSuccessT) => void;
	hasData?: RequisiteEditFormT[];
} & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
