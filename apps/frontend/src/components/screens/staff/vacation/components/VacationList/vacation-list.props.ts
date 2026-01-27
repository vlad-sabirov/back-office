import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { VacationResponse } from '../../interfaces';

export interface VacationListProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: VacationResponse[] | undefined;
}
