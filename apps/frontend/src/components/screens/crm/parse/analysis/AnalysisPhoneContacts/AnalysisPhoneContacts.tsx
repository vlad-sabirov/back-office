import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisPhoneContactsProps } from '.';
import css from './analysis-phone-contacts.module.scss';

type AnalysisPhoneOrganizationsResultT = {
	name: string;
	user: string;
	phone: string;
}

export const AnalysisPhoneContacts: FC<AnalysisPhoneContactsProps> = (
	{ contacts, ...props }
	) => {
	const [result, setResult] = useState<AnalysisPhoneOrganizationsResultT[]>([]);

	useEffect(() => {
		if (!contacts) return;
		for (const item of contacts) {
			if (!item['Телефон'].replace(/[^0-9]/g, '').length) continue;
			const phones = item['Телефон'].split('|');
			if (phones.some(phoneItem => phoneItem.replace(/[^0-9]/g, '').length !== 9)) {
				setResult((prev) => [...prev,
					{
						name: item['ФИО'],
						user: item['Ответственный'],
						phone: item['Телефон']
					}
				]);
			}
		}
	}, [contacts])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
					<th>Телефон</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.phone}</td>
						<td>{item.user}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
