import { ReactNode } from 'react';

export interface HeaderContentProps {
	title: string | ReactNode;
	leftSection?: ReactNode;
	rightSection?: ReactNode;
	className?: string;
}
