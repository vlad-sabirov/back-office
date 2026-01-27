import { isINN } from '@helpers';
import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisInnOrganizationsProps } from '.';
import css from './analysis-inn-organizations.module.scss';

type ResultT = {
	name: string;
	inn: string;
}

export const AnalysisInnOrganizations: FC<AnalysisInnOrganizationsProps> = (
	{ organizations, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!organizations) return;
		for (const organization of organizations) {
			if (!organization['ИНН']) continue;
			const inn = organization['ИНН'].trim();
			const name = organization['Название организации'];
			if (!inn || isINN(inn)) continue;
			setResult((prev) => [...prev, { name, inn }]);
		}
	}, [organizations])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Название организации</th>
					<th>ИНН</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.inn}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
