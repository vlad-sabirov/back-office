import { AvatarProps as MantineAvatarProps } from "@mantine/core";
import { ReactNode } from 'react';

export const AvatarPropsSize = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const;

export interface AvatarProps extends Omit<MantineAvatarProps, 'size'> {
	src?: string | null;
	color?: string;
	text?: ReactNode;
	disabled?: boolean;
	size?: typeof AvatarPropsSize[number];
	className?: string;
	onClick?: () => void;
}
