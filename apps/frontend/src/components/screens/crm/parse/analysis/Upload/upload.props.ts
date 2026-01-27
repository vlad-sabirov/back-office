import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { CsvOrganizationBitrix, CsvContactBitrix } from '../../interfaces';

export type UploadT = {
	organizations: CsvOrganizationBitrix[] | null;
	contacts: CsvContactBitrix[] | null;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
