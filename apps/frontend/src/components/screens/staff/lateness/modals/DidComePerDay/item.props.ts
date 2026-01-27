import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces';

export interface ItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: LatenessDataResponse;
	vacationUsers: number[];
}
