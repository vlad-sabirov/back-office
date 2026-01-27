import { ReactNode, Ref } from "react";
import { MenuItemProps as MantineMenuItemProps } from '@mantine/core';

export const MenuItemPropsColor = ['standard', 'orange', 'blue', 'red'] as const;

export interface MenuItemProps extends MantineMenuItemProps {
	color?: typeof MenuItemPropsColor[number];
	icon?: ReactNode;
	iconRight?: ReactNode;
	disabled?: boolean;
	onClick?: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component?: any;
	href?: string;
	ref?: Ref<unknown>;
}
