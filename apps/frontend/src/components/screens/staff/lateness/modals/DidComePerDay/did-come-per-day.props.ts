import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces/lateness';

export interface DidComePerDayModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	date: Date;
	data: LatenessDataResponse[];
	isOpen: boolean;
	setOpen: (value: boolean) => void;
}
