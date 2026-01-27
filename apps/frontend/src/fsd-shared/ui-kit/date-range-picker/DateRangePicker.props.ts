import { DateRangePickerProps as MantineDateRangePickerProps } from '@mantine/dates';

export const DateRangePickerPropsSize = ['medium', 'large'] as const;
export const DateRangePickerPropsVariant = ['white', 'gray', 'darkGray'] as const;

export interface DateRangePickerProps extends Omit<MantineDateRangePickerProps, 'size' | 'variant'> {
	size?: typeof DateRangePickerPropsSize[number];
	variant?: typeof DateRangePickerPropsVariant[number];
}
