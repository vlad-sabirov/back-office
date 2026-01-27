import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export const TextFiendPropsSize = ['small', 'medium', 'large'] as const;
export const TextFiendPropsMode = ['paragraph', 'heading'] as const;

export interface TextFieldProps extends DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> {
	size?: typeof TextFiendPropsSize[number];
	mode?: typeof TextFiendPropsMode[number];
	children?: ReactNode;
	disabled?: boolean;
}
