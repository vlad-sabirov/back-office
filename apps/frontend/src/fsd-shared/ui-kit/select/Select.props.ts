import { ReactNode } from 'react';
import { SelectProps as MantineSelectProps } from '@mantine/core';

export const SelectPropsInputSize = ['medium', 'large'] as const;
export const SelectPropsInputVariant = ['white', 'gray'] as const;

export interface SelectProps extends Omit<MantineSelectProps, 'size' | 'variant' | 'iconLeft' | 'iconRight'> {
	size?: typeof SelectPropsInputSize[number];
	variant?: typeof SelectPropsInputVariant[number];
	iconLeft?: ReactNode;
}
