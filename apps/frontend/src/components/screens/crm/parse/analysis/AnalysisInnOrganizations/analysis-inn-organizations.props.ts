import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisInnOrganizationsProps = {
	organizations: CsvOrganizationBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
