import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface OrganizationTagListModalProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	isOpen: boolean;
	setOpen: (value: boolean) => void;
}
