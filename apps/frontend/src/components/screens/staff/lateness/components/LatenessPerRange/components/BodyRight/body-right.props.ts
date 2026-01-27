import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces';

export interface BodyRightProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	className?: string;
	data: LatenessDataResponse | null;
	onSuccess?: () => void;
}
