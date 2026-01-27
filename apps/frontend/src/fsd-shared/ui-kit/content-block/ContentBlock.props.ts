import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface ContentBlockProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	title?: string;
	children?: ReactNode;
	width?: number;
	height?: number;
	withoutPaddingX?: boolean;
	withoutPaddingY?: boolean;
	loading?: boolean;
}
