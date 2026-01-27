import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisNameContactsProps } from '.';
import css from './analysis-name-contacts.module.scss';

export const AnalysisNameContacts: FC<AnalysisNameContactsProps> = (
	{ contacts, ...props }
) => {
	const [result, setResult] = useState<{ name: string; }[]>([]);

	useEffect(() => {
		if (!contacts) return;
		for (const contact of contacts) {
			const name = contact['ФИО'];
			if (name.length > 3) continue;
			setResult((prev) => [...prev, { name }]);
		}
	}, [contacts]);
	
	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
