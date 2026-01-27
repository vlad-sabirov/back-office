import { DetailedHTMLProps, FormHTMLAttributes } from 'react';

export interface VacationAddModalProps extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	opened: boolean;
	setOpened: (val: boolean) => void;
}

export interface VacationAddModalFormProps {
	userId: string;
	dateStart: Date;
	dateEnd: Date;
	comment?: string;
	isFake: boolean;
}
