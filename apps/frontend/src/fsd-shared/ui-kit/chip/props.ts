import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export const ChipPropsColor = ['transparent', 'neutral', 'primary', 'infoHard', 'male', 'female'] as const;
export const ChipPropsSize = ['extraSmall', 'small', 'medium', 'large'] as const;

export interface ChipProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	color?: typeof ChipPropsColor[number] | string;
	size?: typeof ChipPropsSize[number];
	data?: ReactNode;
	leftSide?: ReactNode;
	rightSide?: ReactNode;
	disabled?: boolean;
}
