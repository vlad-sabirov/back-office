import { ReactNode } from 'react';
import { MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';

export const MultiSelectPropsInputMode = ['standard', 'staff'] as const;
export const MultiSelectPropsInputSize = ['medium', 'large'] as const;
export const MultiSelectPropsInputColor = ['white', 'gray'] as const;

export interface MultiSelectProps extends Omit<MantineMultiSelectProps, 'size' | 'color' | 'iconLeft' | 'mode'> {
	mode?: typeof MultiSelectPropsInputMode[number];
	size?: typeof MultiSelectPropsInputSize[number];
	color?: typeof MultiSelectPropsInputColor[number];
	iconLeft?: ReactNode;
}
