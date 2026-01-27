import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisInnDuplicateOrganizationsProps = {
	organizations: CsvOrganizationBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
