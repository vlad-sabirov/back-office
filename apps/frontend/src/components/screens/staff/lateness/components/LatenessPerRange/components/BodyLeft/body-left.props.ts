import { LatenessDataResponse } from '@interfaces';

export interface BodyLeftProps {
	data: LatenessDataResponse[];
	className?: string;
	setCurrentLateness: (value: LatenessDataResponse) => void;
}
