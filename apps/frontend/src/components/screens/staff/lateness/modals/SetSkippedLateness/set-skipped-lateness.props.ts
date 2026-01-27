import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces';

export interface SetSkippedLatenessModalProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: LatenessDataResponse | null;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
