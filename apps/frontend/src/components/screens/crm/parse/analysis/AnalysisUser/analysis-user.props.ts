import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganization1C, CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisUserProps = {
	organizationsBitrix: CsvOrganizationBitrix[] | null;
	organizations1C: CsvOrganization1C[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
