import { ReactNode } from 'react';

export const DateMonthPickerPropsInputSize = ['medium', 'large'] as const;
export const DateMonthPickerPropsInputVariant = ['white', 'gray', 'darkGray'] as const;

export interface DateMonthPickerPropsValue {
	year: string;
	month: string;
}

interface DateMonthPickerProps {
	target?: ReactNode;
	size?: (typeof DateMonthPickerPropsInputSize)[number];
	variant?: (typeof DateMonthPickerPropsInputVariant)[number];
	label?: string;
	value?: DateMonthPickerPropsValue | null;
	defaultValue?: DateMonthPickerPropsValue | null;
	onChange?: (event: DateMonthPickerPropsValue | null) => void;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string | null;
}

export default DateMonthPickerProps;
