import { CrmOrganizationResponse } from '@interfaces/crm';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type ListT = {
	organizations: CrmOrganizationResponse[];
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type ListTableT = Pick<ListT, 'organizations'>
