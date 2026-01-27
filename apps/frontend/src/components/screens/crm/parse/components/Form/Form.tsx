import { FC, useContext, useEffect, useState } from 'react';
import { MIME_TYPES } from '@mantine/dropzone';
import CsvService from '@services/Csv.service';
import { Dropzone } from '@fsd/shared/ui-kit';
import { FormProps } from '.';
import { ParseContext } from '../..';
import css from './form.module.scss';

import {
	CsvContactBitrix,
	CsvOrganization1C,
	CsvOrganizationBitrix
} from '../../interfaces';

export const Form: FC<FormProps> = ({ ...props }) => {
	const Store = useContext(ParseContext);
	const [fileBitrixOrgs, setFileBitrixOrgs] = useState<File | null>(null);
	const [fileBitrixContacts, setFileBitrixContacts] = useState<File | null>(null);
	const [file1COrgs, setFile1COrgs] = useState<File | null>(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!fileBitrixOrgs) return;
			const [parsedBitrixOrgs] = await CsvService.toJson<CsvOrganizationBitrix>(fileBitrixOrgs)
			if (isMounted && parsedBitrixOrgs) Store.setOrganizationsBitrix(parsedBitrixOrgs);
		})();
		return () => { isMounted = false; };
	}, [Store, fileBitrixOrgs]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!fileBitrixContacts) return;
			const [parsedBitrixContacts] = await CsvService.toJson<CsvContactBitrix>(fileBitrixContacts)
			if (isMounted && parsedBitrixContacts) Store.setContactsBitrix(parsedBitrixContacts);
		})();
		return () => { isMounted = false; };
	}, [Store, fileBitrixContacts]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (!file1COrgs) return;
			const [parsed1COrgs] = await CsvService.toJson<CsvOrganization1C>(file1COrgs)
			if (isMounted && parsed1COrgs) Store.setOrganizations1C(parsed1COrgs);
		})();
		return () => { isMounted = false; };
	}, [Store, file1COrgs]);

	return (
		<div {...props} className={css.wrapper}>
			<Dropzone
				label='Bitrix организации'
				accept={[MIME_TYPES.csv]}
				defaultStatus={ <div>Перетащите файл csv</div> }
				acceptStatus={ <div>Файл принимается</div> }
				rejectStatus={ <div>Файл не принимается</div> }
				onDrop={(files) => { setFileBitrixOrgs(files[0]); }}
				required
			/>

			<Dropzone
				label='Bitrix контакты'
				accept={[MIME_TYPES.csv]}
				defaultStatus={ <div>Перетащите файл csv</div> }
				acceptStatus={ <div>Файл принимается</div> }
				rejectStatus={ <div>Файл не принимается</div> }
				onDrop={(files) => { setFileBitrixContacts(files[0]); }}
				required
			/>

			<Dropzone
				label='1C организации'
				accept={[MIME_TYPES.csv]}
				defaultStatus={ <div>Перетащите файл csv</div> }
				acceptStatus={ <div>Файл принимается</div> }
				rejectStatus={ <div>Файл не принимается</div> }
				onDrop={(files) => { setFile1COrgs(files[0]); }}
				required
			/>
		</div>
	);
};
