import { SegmentedControlProps as MantineSegmentedControlProps } from '@mantine/core';

export const SegmentedControlPropsColor = ['lighten', 'darken', 'primary', 'male', 'female'] as const;
export const SegmentedControlPropsSize = ['medium', 'large', 'extraLarge'] as const;

export interface SegmentedControlProps extends Omit<MantineSegmentedControlProps, 'size'> {
	color?: typeof SegmentedControlPropsColor[number];
	size?: typeof SegmentedControlPropsSize[number];
	label?: string;
	required?: boolean;
}
