import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { ModalProps as MantineModalProps } from '@mantine/core';

export interface ModalProps extends Omit<MantineModalProps, 'title'> {
	title: string | ReactNode;
	loading?: boolean;
}
export interface ModalButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}
