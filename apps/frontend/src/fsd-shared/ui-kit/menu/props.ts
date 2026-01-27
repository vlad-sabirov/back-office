import { ReactNode } from 'react';
import { MenuProps as MantineMenuProps } from '@mantine/core';

export const MenuPropsMode = ['standard', 'user'] as const;

export interface MenuProps extends Omit<MantineMenuProps, 'size'> {
	mode?: typeof MenuPropsMode[number];
	width?: number;
	control: ReactNode;
	className?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
}
