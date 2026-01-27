import { ReactNode } from 'react';

export const IProgressPropsSize = ['extraSmall', 'small', 'medium', 'large'] as const;
export const IProgressPropsColor = ['primary', 'green', 'yellow', 'red'] as const;
export const IProgressPropsLabelDirection = ['top', 'bottom', 'left', 'right'] as const;

export interface IProgressProps {
	size?: typeof IProgressPropsSize[number];
	color?: typeof IProgressPropsColor[number];
	value: number;
	className?: string;
	label?: string | ReactNode;
	labelDirection?: typeof IProgressPropsLabelDirection[number];
	disabled?: boolean;
}
