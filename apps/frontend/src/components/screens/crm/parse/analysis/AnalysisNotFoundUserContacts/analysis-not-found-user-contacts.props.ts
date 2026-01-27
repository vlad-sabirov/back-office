import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvContactBitrix } from '../../interfaces';

export type AnalysisNotFoundUserContactsProps = {
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
