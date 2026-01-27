import { ReactNode } from 'react';
import { TextInputProps } from '@mantine/core';

export const InputPropsInputSize = ['medium', 'large'] as const;
export const InputPropsInputVariant = ['white', 'gray', 'darkGray'] as const;
export const InputPropsInputMode = ['text', 'password', 'phone', 'email'] as const;

export interface InputProps extends Omit<TextInputProps, 'size' | 'variant' | 'iconLeft' | 'iconRight'> {
	size?: typeof InputPropsInputSize[number];
	variant?: typeof InputPropsInputVariant[number];
	mode?: typeof InputPropsInputMode[number];
	iconLeft?: ReactNode;
	iconRight?: ReactNode;
	disabled?: boolean;
}
