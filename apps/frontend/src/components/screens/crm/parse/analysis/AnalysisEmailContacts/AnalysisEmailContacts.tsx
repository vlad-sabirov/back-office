import { isEmail } from '@helpers';
import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisEmailContactsProps } from '.';
import css from './analysis-email-contacts.module.scss';

type AnalysisEmailContactsResultT = {
	name: string;
	email: string;
	user: string;
}

export const AnalysisEmailContacts: FC<AnalysisEmailContactsProps> = (
	{ contacts, ...props }
) => {
	const [result, setResult] = useState<AnalysisEmailContactsResultT[]>([]);

	useEffect(() => {
		if (!contacts) return;
		for (const organization of contacts) {
			if (!organization['Почта']) continue;
			const email = organization['Почта'].split("|");
			const name = organization['ФИО'];
			const user = organization['Ответственный'];
			const findWrongEmail = email.find(item => !isEmail(item));

			if (!email || !findWrongEmail) continue;
			setResult((prev) => [...prev, { name, user, email: findWrongEmail }]);
		}
	}, [contacts]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
					<th>Почтовый ящик</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.email}</td>
						<td>{item.user}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
