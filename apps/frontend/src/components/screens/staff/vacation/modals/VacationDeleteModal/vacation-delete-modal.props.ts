import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { VacationResponse } from '../../interfaces';

export interface VacationDeleteModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: VacationResponse | undefined;
	opened: boolean;
	setOpened: (val: boolean) => void;
}
