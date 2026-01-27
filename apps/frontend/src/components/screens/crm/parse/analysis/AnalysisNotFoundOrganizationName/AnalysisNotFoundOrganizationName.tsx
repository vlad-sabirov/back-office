import { MainContext } from '@globalStore';
import { TextField } from '@fsd/shared/ui-kit';
import { observer } from 'mobx-react-lite';
import { FC, useContext, useEffect, useState } from 'react';
import { AnalysisNotFoundUserOrganizationsProps } from '.';
import css from './analysis-not-found-user-organizations.module.scss';

type AnalysisNotFoundUserOrganizationsResultT = {
	contactName: string;
	organizatioNName: string;
}

export const AnalysisNotFoundOrganizationName: FC<AnalysisNotFoundUserOrganizationsProps> = observer((
	{ organizations, contacts, ...props }
) => {
	const { staffStore } = useContext(MainContext)
	const [result, setResult] = useState<AnalysisNotFoundUserOrganizationsResultT[]>([]);
	

	useEffect(() => {
		if (!organizations || !contacts) return;
		for (const contact of contacts) {
			const contactName = contact['ФИО'];
			const contactOrganizationName = contact['Название организации'];
			if (!contactOrganizationName.length) continue;
			const foundOrganization = organizations.some(
				(organization) => organization['Название организации'] === contactOrganizationName
			);
			if (!foundOrganization) {
				setResult((prev) => [...prev,
					{
						contactName,
						organizatioNName: contactOrganizationName
					}
				]);
			}
		}
	}, [organizations, contacts, staffStore.userList])

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
					<th>Название организации</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.contactName}</td>
						<td>{item.organizatioNName}</td>
					</tr>
				))}
			</table>
		</div>
	);
});
