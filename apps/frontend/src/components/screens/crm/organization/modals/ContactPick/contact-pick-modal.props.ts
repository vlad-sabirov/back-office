import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { FormEmailT, FormPhoneT } from '../../drawers';
import { ContactItemT } from '../../drawers/OrganizationAdd/forms';

export type ContactPickModalT = {
	type: 'find' | 'update' | 'delete' | 'disconnect';
	current?: ContactItemT;
	opened: boolean;
	setOpened: (val: boolean) => void;
	onSuccess: (res: ContactItemT) => void;
	hasContactIds: string[];
	hasPhoneData: FormPhoneT[];
	hasEmailData: FormEmailT[];
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
