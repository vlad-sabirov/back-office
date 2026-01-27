import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisWebsiteOrganizationsProps = {
	organizations: CsvOrganizationBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
