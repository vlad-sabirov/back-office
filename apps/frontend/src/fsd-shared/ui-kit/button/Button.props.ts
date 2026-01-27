import { ReactNode } from 'react';
import { ButtonProps as MantineButtonProps } from '@mantine/core';

export const ButtonPropsInputColor = [
	'neutral',
	'transparent',
	'primary',
	'info',
	'success',
	'warning',
	'error'
] as const;

export const ButtonPropsInputSize = [
	'small', 
	'medium', 
	'large', 
	'extraLarge'
] as const;

export const ButtonPropsInputVariant = ['hard', 'easy'] as const;

export interface ButtonProps
	extends Omit<MantineButtonProps, 'size' | 'variant'>
{     
	color?: typeof ButtonPropsInputColor[number];
	size?: typeof ButtonPropsInputSize[number];
	variant?: typeof ButtonPropsInputVariant[number];
	iconLeft?: ReactNode;
	iconRight?: ReactNode;
	children: ReactNode;
	onClick?: () => void;
}
