import { ReactNode } from 'react';
import { NumberInputProps } from '@mantine/core';

export const InputNumberPropsInputMode = ['numbers', 'phone'] as const;
export const InputNumberPropsInputSize = ['medium', 'large'] as const;
export const InputNumberPropsInputVariant = ['white', 'gray'] as const;

export interface InputNumberProps extends Omit<NumberInputProps, 'size' | 'variant' | 'icon'> {
	mode?: typeof InputNumberPropsInputMode[number];
	size?: typeof InputNumberPropsInputSize[number];
	variant?: typeof InputNumberPropsInputVariant[number];
	iconLeft?: ReactNode;
}
