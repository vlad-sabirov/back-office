import { CrmContactResponse } from '@interfaces';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type ContactCardT = {
	contact: CrmContactResponse;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
