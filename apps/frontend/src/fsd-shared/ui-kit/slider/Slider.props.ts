import { SliderProps as MantineSliderProps } from '@mantine/core';

export const SliderPropsSize = ['medium', 'large'] as const;

export interface SliderProps extends Omit<MantineSliderProps, 'size' | 'color'> {
	labelName?: string;
	size?: typeof SliderPropsSize[number];
}
