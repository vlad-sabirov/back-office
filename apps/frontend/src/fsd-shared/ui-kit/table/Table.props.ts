import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface TablePropsHeader {
	key: string;
	label: string;
	width?: string | number;
	verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface TablePropsBodyObject {
	index: string | number;
	output: string | ReactNode;
}

export type TablePropsBodySettings = {
	color?: 'red' | 'green' | 'yellow' | 'purple';
};

export interface TablePropsBody {
	[key: string]: TablePropsBodyObject | TablePropsBodySettings;
}

export interface TablePropsData {
	header: TablePropsHeader[];
	sortKeys: string[];
	sortDefault?: 'asc' | 'desc';
	body: TablePropsBody[] | undefined;
}

export interface TableProps extends DetailedHTMLProps<HTMLAttributes<HTMLTableElement>, HTMLTableElement> {
	data: TablePropsData | null;
}
