import { MainContext } from '@globalStore';
import { TextField } from '@fsd/shared/ui-kit';
import { observer } from 'mobx-react-lite';
import { FC, useContext, useEffect, useState } from 'react';
import { AnalysisNotFoundUserContactsProps } from '.';
import css from './analysis-not-found-user-contacts.module.scss';

type AnalysisNotFoundUserContactsResultT = {
	name: string;
	user: string;
}

export const AnalysisNotFoundUserContacts: FC<AnalysisNotFoundUserContactsProps> = observer((
	{ contacts, ...props }
) => {
	const { staffStore } = useContext(MainContext)
	const [result, setResult] = useState<AnalysisNotFoundUserContactsResultT[]>([]);
	

	useEffect(() => {
		if (!contacts) return;
		for (const contact of contacts) {
			const [lastName, firstName] = contact['Ответственный'].split(' ');
			if (!contact['Ответственный']) continue;
			const foundUser = staffStore.userList.some(
				(user) => user.lastName === lastName && user.firstName === firstName
			);			
			if (!foundUser) {
				setResult((prev) => [...prev,
					{
						name: contact['ФИО'],
						user: contact['Ответственный']
					}
				]);
			}
		}
	}, [contacts, staffStore.userList])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.user}</td>
					</tr>
				))}
			</table>
		</div>
	);
});
