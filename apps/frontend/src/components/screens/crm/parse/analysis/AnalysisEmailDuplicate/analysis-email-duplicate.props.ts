import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvContactBitrix, CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisEmailDuplicateProps = {
	organizations: CsvOrganizationBitrix[] | null;
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
