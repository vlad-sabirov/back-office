import { MainContext } from '@globalStore';
import { TextField } from '@fsd/shared/ui-kit';
import { observer } from 'mobx-react-lite';
import { FC, useContext, useEffect, useState } from 'react';
import { AnalysisNotFoundUserOrganizationsProps } from '.';
import css from './analysis-not-found-user-organizations.module.scss';

type AnalysisNotFoundUserOrganizationsResultT = {
	name: string;
	user: string;
}

export const AnalysisNotFoundUserOrganizations: FC<AnalysisNotFoundUserOrganizationsProps> = observer((
	{ organizations, ...props }
) => {
	const { staffStore } = useContext(MainContext)
	const [result, setResult] = useState<AnalysisNotFoundUserOrganizationsResultT[]>([]);
	

	useEffect(() => {
		if (!organizations) return;
		for (const organization of organizations) {
			const [lastName, firstName] = organization['Ответственный'].split(' ');
			if (!organization['Ответственный']) continue;
			const foundUser = staffStore.userList.some(
				(user) => user.lastName === lastName && user.firstName === firstName
			);			
			if (!foundUser) {
				setResult((prev) => [...prev,
					{
						name: organization['Название организации'],
						user: organization['Ответственный']
					}
				]);
			}
		}
	}, [organizations, staffStore.userList])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Название организации</th>
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
