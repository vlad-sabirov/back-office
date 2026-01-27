import { CrmContactResponse } from '@interfaces';
import { ContactItemT } from '@screens/crm/organization/drawers/OrganizationAdd/forms';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type ConnectContactT = {
	contactsFound: CrmContactResponse[];
	setFoundContacts: (value: CrmContactResponse[]) => void;
	onSuccess: (response: ContactItemT) => void;
	setModalVisible: (value: boolean) => void;
	setTitle: (value: string) => void;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
