import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface StructureLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	children: ReactNode;
}
