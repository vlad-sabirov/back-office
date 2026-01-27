import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvContactBitrix } from '../../interfaces';

export type AnalysisEmailContactsProps = {
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

