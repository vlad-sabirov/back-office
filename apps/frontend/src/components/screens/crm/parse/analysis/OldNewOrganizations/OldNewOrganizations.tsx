import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { OldNewOrganizationsResultTProps } from '.';
import css from './old-new-organizations.module.scss';

type ResultT = {
	name: string;
	inn: string;
	userOld: string;
	userNew: string;
};

export const OldNewOrganizations: FC<OldNewOrganizationsResultTProps> = (
	{ oldOrgs, newOrgs, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!oldOrgs || !newOrgs) return;
		for (const orgOld of oldOrgs) {
			const orgNew = newOrgs.find(org => org['ИНН'] === orgOld['ИНН']);
			if (!orgNew) continue;
			if (orgNew["Ответственный"] != orgOld["Ответственный"]) {
				if (!orgNew['Ответственный']) return;
				setResult(prev => [...prev, {
					name: orgOld['Название организации'],
					inn: orgOld['ИНН'],
					userOld: orgOld["Ответственный"],
					userNew: orgNew["Ответственный"],
				}]);
			}
		}
	}, [oldOrgs, newOrgs]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ИНН</th>
					<th>Название организации</th>
					<th style={{width: 200}}>Ответственный 1</th>
					<th style={{width: 200}}>Ответственный 2</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.inn}</td>
						<td>{item.name}</td>
						<td>{item.userOld}</td>
						<td>{item.userNew}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
