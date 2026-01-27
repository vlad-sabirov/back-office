import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { ParseStoreAnalyzeTypeT } from '../../parse.store';

import {
	CsvContactBitrix,
	CsvOrganization1C,
	CsvOrganizationBitrix
} from '../../interfaces';

export type OptionsProps = {
	organizationsBitrix: CsvOrganizationBitrix[] | null;
	organizations1C: CsvOrganization1C[] | null;
	contactsBitrix: CsvContactBitrix[] | null;
	onSuccess: (res: ParseStoreAnalyzeTypeT) => void;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
