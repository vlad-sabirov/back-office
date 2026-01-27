import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvContactBitrix } from '../../interfaces';

export type AnalysisNameContactsProps = {
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
