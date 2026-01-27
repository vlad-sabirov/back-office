import { ContactItemT } from '@screens/crm/organization/drawers/OrganizationAdd/forms';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type DisconnectContactT = {
	current?: ContactItemT;
	onSuccess: (response: ContactItemT) => void;
	setModalVisible: (value: boolean) => void;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
