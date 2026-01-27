import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces/lateness';

export interface ArrivedPerDayModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: LatenessDataResponse[];
	isOpen: boolean;
	setOpen: (value: boolean) => void;
}
