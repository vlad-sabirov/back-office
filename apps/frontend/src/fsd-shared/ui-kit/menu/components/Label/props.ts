import { MenuLabelProps as MantineMenuLabelProps } from '@mantine/core';

export const MenuLabelPropsSize = ['small', 'medium'] as const;

export interface MenuLabelProps extends Omit<MantineMenuLabelProps, 'size'> {
	size?: typeof MenuLabelPropsSize[number];
}
