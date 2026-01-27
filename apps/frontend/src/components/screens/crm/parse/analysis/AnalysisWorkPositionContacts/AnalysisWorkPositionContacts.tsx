import { TextField } from '@fsd/shared/ui-kit';
import { FC, useEffect, useState } from 'react';
import { AnalysisWorkPositionContactsProps } from '.';
import css from './analysis-work-position-contacts.module.scss';

type ResultT = {
	name: string;
	workPosition: string;
	user: string;
}

export const AnalysisWorkPositionContacts: FC<AnalysisWorkPositionContactsProps> = (
	{ contacts, ...props }
) => {
	const [result, setResult] = useState<ResultT[]>([]);

	useEffect(() => {
		if (!contacts) return;
		for (const contact of contacts) {			
			const name = contact['ФИО'];
			const workPosition = contact['Должность'];
			const user = contact['Ответственный'];
			if (workPosition.length > 3) continue;
			setResult((prev) => [...prev, { name, user, workPosition }]);
		}
	}, [contacts]);

	return (
		<div className={css.wrapper} {...props}>
			<TextField>Всего несоответствий: {result.length}</TextField>

			<table width={'100%'}>
				<tr>
					<th>ФИО</th>
					<th>Должность</th>
					<th>Ответственный</th>
				</tr>
				{result.map((item, index) => (
					<tr key={index}>
						<td>{item.name}</td>
						<td>{item.workPosition}</td>
						<td>{item.user}</td>
					</tr>
				))}
			</table>
		</div>
	);
};
