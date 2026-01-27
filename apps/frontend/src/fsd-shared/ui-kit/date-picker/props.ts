import { DatePickerProps as MantineDatePickerProps } from '@mantine/dates';

export const DatePickerPropsSize = ['medium', 'large'] as const;
export const DatePickerPropsVariant = ['white', 'gray', 'darkGray'] as const;

export interface DatePickerProps extends Omit<MantineDatePickerProps, 'size' | 'variant'> {
	size?: typeof DatePickerPropsSize[number];
	variant?: typeof DatePickerPropsVariant[number];
}
