import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export const AlertProps = {
	Size: ['small', 'medium', 'large'] as const,
	Color: ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const,
	Variant: ['light', 'filled', 'outline'] as const,
}

export interface AlertT extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	title: string;
	body: string;
	size?: typeof AlertProps.Size[number];
	color?: typeof AlertProps.Color[number];
	variant?: typeof AlertProps.Variant[number];
	icon?: ReactNode;
}
