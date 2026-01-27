import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix } from '../../interfaces';

export type OldNewOrganizationsResultTProps = {
	oldOrgs: CsvOrganizationBitrix[] | null;
	newOrgs: CsvOrganizationBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

