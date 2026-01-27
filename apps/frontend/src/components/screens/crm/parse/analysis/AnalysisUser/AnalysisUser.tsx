import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisUserProps } from '.';
import css from './analysis-user.module.scss';

type ResultT = {
	name: string;
	inn: string;
	userBitrix: string;
	user1C: string;
};

export const AnalysisUser: FC<AnalysisUserProps> = (
	{ organizationsBitrix, organizations1C, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!organizationsBitrix || !organizations1C) return;
		for (const orgBitrix of organizationsBitrix) {
			const org1C = organizations1C.find(org => org['ИНН'] === orgBitrix['ИНН']);
			if (!org1C) continue;
			if (org1C["Ответственный"] != orgBitrix["Ответственный"]) {
				if (!org1C['Ответственный']) return;
				setResult(prev => [...prev, {
					name: orgBitrix['Название организации'],
					inn: orgBitrix['ИНН'],
					userBitrix: orgBitrix["Ответственный"],
					user1C: org1C["Ответственный"],
				}]);
			}
		}
	}, [organizationsBitrix, organizations1C]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ИНН</th>
					<th>Название организации</th>
					<th style={{width: 200}}>Ответственный в битриксе</th>
					<th style={{width: 200}}>Ответственный в 1с</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.inn}</td>
						<td>{item.name}</td>
						<td>{item.userBitrix}</td>
						<td>{item.user1C}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
