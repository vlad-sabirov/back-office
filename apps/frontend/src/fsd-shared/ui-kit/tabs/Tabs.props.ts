import { TabsProps as MantineTabsProps } from '@mantine/core';

export const TabsPropsSize = ['small', 'medium', 'large'] as const;
export const TabsPropsColor = ['neutral', 'primary'] as const;

export interface TabsProps extends Omit<MantineTabsProps, 'size' | 'color' | 'disabled'> {
	size?: typeof TabsPropsSize[number];
	color?: typeof TabsPropsColor[number];
}
