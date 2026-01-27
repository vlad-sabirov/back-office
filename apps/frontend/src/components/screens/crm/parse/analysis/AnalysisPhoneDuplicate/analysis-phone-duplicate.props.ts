import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvContactBitrix, CsvOrganizationBitrix } from '../../interfaces';

export type AnalysisPhoneDuplicateProps = {
	organizations: CsvOrganizationBitrix[] | null;
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
