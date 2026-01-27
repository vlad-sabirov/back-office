import { isURL } from '@helpers';
import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisWebsiteOrganizationsProps } from '.';
import css from './analysis-website-organizations.module.scss';

type AnalysisWebsiteOrganizationsResultT = {
	name: string;
	website: string;
}

export const AnalysisWebsiteOrganizations: FC<AnalysisWebsiteOrganizationsProps> = (
	{ organizations, ...props }
) => {
	const [result, setResult] = useState<AnalysisWebsiteOrganizationsResultT[]>([]);

	useEffect(() => {
		if (!organizations) return;
		for (const organization of organizations) {
			const name = organization['Название организации'];
			const website = organization['Вебсайт'];
			if (!website.length || isURL(website)) continue;
			setResult((prev) => [...prev, { name, website }]);
		}
	}, [organizations]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>Название организации</th>
					<th>Телефон</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.website}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
