import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisNotFoundUserOrganizationsProps = {
	organizations: CsvOrganizationBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
