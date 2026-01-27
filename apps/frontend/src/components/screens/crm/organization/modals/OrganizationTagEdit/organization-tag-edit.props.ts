import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { CrmOrganizationTypeResponse } from '@interfaces';

export interface OrganizationTagEditModalProps
	extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	data: CrmOrganizationTypeResponse | null;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
