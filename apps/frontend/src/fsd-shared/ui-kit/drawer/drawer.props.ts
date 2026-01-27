import { TextFiendPropsSize } from '@fsd/shared/ui-kit';
import { DrawerProps as MantineDrawerProps } from '@mantine/core';

export const DrawerPropsPosition = ['left', 'right'] as const;

export interface DrawerProps extends MantineDrawerProps {
	width: string | number;
	position: (typeof DrawerPropsPosition)[number];
	title?: string;
	titleSize?: (typeof TextFiendPropsSize)[number];
	loading?: boolean;
	sharedLink?: string;
}
