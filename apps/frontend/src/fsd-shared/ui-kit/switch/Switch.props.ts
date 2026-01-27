import { SwitchProps as MantineSwitchProps } from '@mantine/core';

export const SwitchPropsSize = ['small', 'medium', 'large'] as const;
export const SwitchPropsColor = ['neutral', 'primary'] as const;

export interface SwitchProps extends Omit<MantineSwitchProps, 'size' | 'color'> {
	size?: typeof SwitchPropsSize[number];
	color?: typeof SwitchPropsColor[number];
}
