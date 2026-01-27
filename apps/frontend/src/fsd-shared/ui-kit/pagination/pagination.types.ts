import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type PaginationT = {
	page: number;
	total: number;
	limit: number;
	siblings?: number;
	onChangePage: (page: number) => void;
	onChangeLimit: (limit: number) => void;
	limitSelect?: number[];
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
