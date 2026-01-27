import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface DateMonthPickerWithArrowProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	date: Date;
	setDate: (value: Date) => void;
	minDate?: Date;
	maxDate?: Date;
}
