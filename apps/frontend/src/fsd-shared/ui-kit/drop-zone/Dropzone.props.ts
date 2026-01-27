import { ReactNode } from 'react';
import { DropzoneProps as MantineDropzoneProps } from '@mantine/dropzone';

export interface DropzoneProps extends Omit<MantineDropzoneProps, 'size' | 'children'> {
	label?: string;
	defaultStatus: ReactNode;
	acceptStatus?: ReactNode;
	rejectStatus?: ReactNode;
	required?: boolean;
	disabled?: boolean;
	error?: string;
}
