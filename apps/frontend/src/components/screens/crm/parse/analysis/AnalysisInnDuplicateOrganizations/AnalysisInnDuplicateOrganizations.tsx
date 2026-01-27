import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisInnDuplicateOrganizationsProps } from '.';
import css from './analysis-inn-duplicate-organizations.module.scss';

type ResultT = {
	inn: string;
	orgs: {
		name: string,
		user: string
	}[]
}

export const AnalysisInnDuplicateOrganizations: FC<AnalysisInnDuplicateOrganizationsProps> = (
	{ organizations, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!organizations) return;
		const innList: string[] = [];
		const result: string[] = [];
		organizations.forEach((organization) => {
			if (!organization['ИНН']) return;
			const inn = organization['ИНН'].trim();
			if (!inn) return;
			if (innList.includes(inn)) {
				result.push(inn);
			} else {
				innList.push(inn);
			}
		});

		result.forEach((inn) => {
			const orgs = organizations.filter((item) => item['ИНН'].trim() === inn).map((item) => ({
				name: item['Название организации'],
				user: item['Ответственный']
			}));
			setResult((prev) => [...prev, { inn, orgs }]);
		})
	}, [organizations])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ИНН</th>
					<th>Название организации</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item) => {
					return (<>
						{item.orgs.map((org, index) => (
							<tr key={index}>
								{index === 0 && <td rowSpan={item.orgs.length}>{item.inn}</td>}
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
