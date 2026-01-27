import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface BodyLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	children: ReactNode;
}
