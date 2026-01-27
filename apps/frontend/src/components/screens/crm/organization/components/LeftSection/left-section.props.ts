import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface LeftSectionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	isLoading?: boolean;
}
