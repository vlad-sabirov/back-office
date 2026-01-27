import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisEmailDuplicateProps } from '.';
import css from './analysis-email-duplicate.module.scss';

type ResultT = {
	email: string;
	found: {
		type: 'organization' | 'contact';
		name: string;
		user: string;
	}[]
}

export const AnalysisEmailDuplicate: FC<AnalysisEmailDuplicateProps> = (
	{ organizations, contacts, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!organizations || !contacts) return;
		const data: ResultT[] = [];
		const uniquePhones: string[] = [];

		for (const item of organizations) {
			if (!item['Почта']) continue;
			const emails = item['Почта'].split('|');
			const name = item['Название организации'];
			const user = item['Ответственный'];
			emails.forEach((email) => data.push({
				email,
				found: [{ type: 'organization', name, user }]
				
			}));
		}

		for (const item of contacts) {
			if (!item['Почта']) continue;
			const emails = item['Почта'].split('|');
			const name = item['ФИО'];
			const user = item['Ответственный'];
			emails.forEach((email) => data.push({
				email,
				found: [{ type: 'contact', name, user }]
			}));
		}

		// Найди дубликаты телефонов в массиве data и добавь их в массив duplicates
		for (const item of data) {
			if (!uniquePhones.includes(item.email)) {
				uniquePhones.push(item.email);
				continue;
			}

			const duplicates = data
				.filter((itemData) => itemData.email === item.email)
				.map((itemData) => itemData.found);

			setResult((prev) => [...prev, {
				email: item.email,
				found: duplicates.flat()
			}]);
		}	
		
	}, [organizations, contacts])	

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Почта</th>
					<th>Тип</th>
					<th>Название</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item) => {
					return (<>
						{item.found.map((org, index) => (
							<tr key={index}>
								{index === 0 && <td rowSpan={item.found.length}>{item.email}</td>}
								<td>{org.type === 'contact' ? 'Контакт' : 'Организация'}</td>
								<td>{org.name}</td>
								<td>{org.user}</td>
							</tr>
						))}
					</>);
				})}
			</table>
		</div>
	);
};
