import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisPhoneOrganizationsProps } from '.';
import css from './analysis-phone-organizations.module.scss';

type AnalysisPhoneOrganizationsResultT = {
	name: string;
	phone: string;
}

export const AnalysisPhoneOrganizations: FC<AnalysisPhoneOrganizationsProps> = (
	{ organizations, ...props }
	) => {
	const [result, setResult] = useState<AnalysisPhoneOrganizationsResultT[]>([]);

	useEffect(() => {
		if (!organizations) return;
		for (const item of organizations) {
			if (!item['Телефон'].replace(/[^0-9]/g, '').length) continue;
			const phones = item['Телефон'].split('|');
			if (phones.some(phoneItem => phoneItem.replace(/[^0-9]/g, '').length !== 9)) {
				setResult((prev) => [...prev,
					{
						name: item['Название организации'],
						phone: item['Телефон']
					}
				]);
			}
		}
	}, [organizations])

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
						<td>{item.phone}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
