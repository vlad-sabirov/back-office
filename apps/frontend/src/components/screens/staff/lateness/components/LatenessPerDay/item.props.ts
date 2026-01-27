import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces/lateness';

export interface ItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: LatenessDataResponse[];
	title: string;
	displayTime: string;
	subtitle: string;
	onClick: () => void;
}
