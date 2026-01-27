import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CrmOrganizationTypeResponse } from '@interfaces';

export interface OrganizationTypeDeleteModalProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: CrmOrganizationTypeResponse | null;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
