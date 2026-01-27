import { isEmail } from '@helpers';
import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisEmailOrganizationsProps } from '.';
import css from './analysis-email-organizations.module.scss';

type AnalysisEmailOrganizationsResultT = {
	name: string;
	email: string;
}

export const AnalysisEmailOrganizations: FC<AnalysisEmailOrganizationsProps> = (
	{ organizations, ...props }
) => {
	const [result, setResult] = useState<AnalysisEmailOrganizationsResultT[]>([]);

	useEffect(() => {
		if (!organizations) return;
		for (const organization of organizations) {
			if (!organization['Почта']) continue;
			const email = organization['Почта'].split("|");
			const name = organization['Название организации'];
			const findWrongEmail = email.find(item => !isEmail(item));

			if (!email || !findWrongEmail) continue;
			setResult((prev) => [...prev, { name, email: findWrongEmail }]);
		}
	}, [organizations]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Название организации</th>
					<th>Почтовый ящик</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.email}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
