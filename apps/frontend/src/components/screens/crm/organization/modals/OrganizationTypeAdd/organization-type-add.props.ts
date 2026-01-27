import { DetailedHTMLProps, FormHTMLAttributes } from 'react';

export interface OrganizationTypeAddModalProps
	extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
