import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { AvatarProps, AvatarPropsSize } from '@fsd/shared/ui-kit';

export const AvatarGroupPropsBorderColor = ['white', 'gray'] as const;

export interface AvatarGroupProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	limit: number;
	size?: typeof AvatarPropsSize[number];
	borderColor?: typeof AvatarGroupPropsBorderColor[number];
	data: Omit<AvatarProps, 'size' | 'className'>[];
	topPosition?: 'left' | 'right';
}
