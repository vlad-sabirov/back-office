import { FC, useEffect, useState } from 'react';
import { ContentBlock } from '@fsd/shared/ui-kit';
import $api from '@helpers/Api.http';
import { Grid, Badge, Loader, Table } from '@mantine/core';
import css from './staff-power-overview.module.scss';

interface StaffPowerItem {
	userId: number;
	firstName: string;
	lastName: string;
	full: number;
	medium: number;
	low: number;
	empty: number;
	total: number;
}

export const StaffPowerOverview: FC = () => {
	const [data, setData] = useState<StaffPowerItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const res = await $api.get('/crm/organization/power-by-staff');
				if (isMounted) setData(res.data || []);
			} catch {
				if (isMounted) setError(true);
			} finally {
				if (isMounted) setLoading(false);
			}
		})();
		return () => { isMounted = false; };
	}, []);

	if (loading) {
		return (
			<Grid.Col span={50}>
				<ContentBlock title="Организации сотрудников">
					<div className={css.loading}>
						<Loader size="sm" />
					</div>
				</ContentBlock>
			</Grid.Col>
		);
	}

	if (error || !data.length) {
		return null;
	}

	return (
		<Grid.Col span={50}>
			<ContentBlock title="Организации сотрудников" className={css.root}>
				<Table className={css.table} fontSize="sm" highlightOnHover>
					<thead>
						<tr>
							<th>Сотрудник</th>
							<th className={css.center}>Активных</th>
							<th className={css.center}>Тёплых</th>
							<th className={css.center}>Холодных</th>
							<th className={css.center}>Забытых</th>
							<th className={css.center}>Всего</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item) => (
							<tr key={item.userId}>
								<td>{item.lastName} {item.firstName}</td>
								<td className={css.center}>
									<Badge color="green" variant="light" size="lg">{item.full}</Badge>
								</td>
								<td className={css.center}>
									<Badge color="yellow" variant="light" size="lg">{item.medium}</Badge>
								</td>
								<td className={css.center}>
									<Badge color="orange" variant="light" size="lg">{item.low}</Badge>
								</td>
								<td className={css.center}>
									<Badge color="red" variant="light" size="lg">{item.empty}</Badge>
								</td>
								<td className={css.center}>
									<Badge color="gray" variant="light" size="lg">{item.total}</Badge>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</ContentBlock>
		</Grid.Col>
	);
};
