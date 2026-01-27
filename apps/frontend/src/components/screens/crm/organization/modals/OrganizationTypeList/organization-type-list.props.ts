import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface OrganizationTypeListModalProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	isOpen: boolean;
	setOpen: (value: boolean) => void;
}
