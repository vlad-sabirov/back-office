import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisPhoneDuplicateProps } from '.';
import css from './analysis-phone-duplicate.module.scss';

type ResultT = {
	phone: string;
	found: {
		type: 'organization' | 'contact';
		name: string;
		user: string;
	}[]
}

export const AnalysisPhoneDuplicate: FC<AnalysisPhoneDuplicateProps> = (
	{ organizations, contacts, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!organizations || !contacts) return;
		const data: ResultT[] = [];
		const uniquePhones: string[] = [];

		for (const item of organizations) {
			if (!item['Телефон']) continue;
			const phones = item['Телефон'].split('|');
			const name = item['Название организации'];
			const user = item['Ответственный'];
			phones.forEach((phone) => data.push({
				phone,
				found: [{ type: 'organization', name, user }]
				
			}));
		}

		for (const item of contacts) {
			if (!item['Телефон']) continue;
			const phones = item['Телефон'].split('|');
			const name = item['ФИО'];
			const user = item['Ответственный'];
			phones.forEach((phone) => data.push({
				phone,
				found: [{ type: 'contact', name, user }]
			}));
		}

		// Найди дубликаты телефонов в массиве data и добавь их в массив duplicates
		for (const item of data) {
			if (!uniquePhones.includes(item.phone)) {
				uniquePhones.push(item.phone);
				continue;
			}

			const duplicates = data
				.filter((itemData) => itemData.phone === item.phone)
				.map((itemData) => itemData.found);

			setResult((prev) => [...prev, {
				phone: item.phone,
				found: duplicates.flat()
			}]);
		}	
		
	}, [organizations, contacts])	

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Телефон</th>
					<th>Тип</th>
					<th>Название</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item) => {
					return (<>
						{item.found.map((org, index) => (
							<tr key={index}>
								{index === 0 && <td rowSpan={item.found.length}>{item.phone}</td>}
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
