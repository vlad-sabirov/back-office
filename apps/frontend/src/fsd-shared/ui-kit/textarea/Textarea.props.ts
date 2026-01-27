import { TextareaProps as MantineTextareaProps } from '@mantine/core';

export const TextareaPropsSize = ['medium', 'large'] as const;
export const TextareaPropsVariant = ['white', 'gray'] as const;

export interface TextareaProps extends Omit<MantineTextareaProps, 'size' | 'variant'> {
	size?: typeof TextareaPropsSize[number];
	height?: number;
	variant?: typeof TextareaPropsVariant[number];
}
