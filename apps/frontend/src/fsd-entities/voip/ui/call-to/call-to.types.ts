import { ReactNode } from 'react';

export interface ICallToProps {
	callToName?: string;
	callToPhone: string;
	children: ReactNode;
	offset?: number;
	width?: number;
}
