import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { VacationResponse } from '../../interfaces';

export interface VacationEditModalProps
	extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	data: VacationResponse | undefined;
	opened: boolean;
	setOpened: (val: boolean) => void;
}

export interface VacationEditModalFormProps {
	userId: string;
	dateStart: Date;
	dateEnd: Date;
	comment?: string;
	isFake: boolean;
}
