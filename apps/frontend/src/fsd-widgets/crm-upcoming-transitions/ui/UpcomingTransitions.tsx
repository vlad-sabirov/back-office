import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { IconBattery } from '@fsd/entities/crm-organization/ui/icon-battery/IconBattery';
import { ContentBlock, TextField } from '@fsd/shared/ui-kit';
import $api from '@helpers/Api.http';
import { Grid, Badge, Loader } from '@mantine/core';
import css from './upcoming-transitions.module.scss';

interface TransitionItem {
	id: number;
	nameRu: string;
	nameEn: string;
	currentStatus: string;
	nextStatus: string;
	daysLeft: number;
	last1CUpdate: string | null;
}

const statusLabels: Record<string, string> = {
	full: 'Активные',
	medium: 'Тёплые',
	low: 'Холодные',
	empty: 'Забытые',
};

const statusColors: Record<string, string> = {
	medium: 'yellow',
	low: 'orange',
	empty: 'red',
};

export const UpcomingTransitions: FC = () => {
	const router = useRouter();
	const [data, setData] = useState<TransitionItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const res = await $api.get('/crm/organization/upcoming-transitions');
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
			<Grid.Col span={30}>
				<ContentBlock title="Скоро сменят статус">
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
		<Grid.Col span={30}>
			<ContentBlock title="Скоро сменят статус" className={css.root}>
				<div className={css.list}>
					{data.map((item) => (
						<div
							key={item.id}
							className={css.item}
							onClick={() => router.push(`/crm/organization/${item.id}`)}
						>
							<div className={css.itemLeft}>
								<IconBattery updatedAt={null} hardType={item.nextStatus as any} />
								<div className={css.itemInfo}>
									<TextField className={css.itemName}>
										{item.nameRu || item.nameEn || 'Без названия'}
									</TextField>
									<span className={css.itemTransition}>
										{statusLabels[item.currentStatus]} → {statusLabels[item.nextStatus]}
									</span>
								</div>
							</div>
							<Badge
								color={statusColors[item.nextStatus] || 'gray'}
								variant="light"
								size="sm"
							>
								{item.daysLeft <= 0 ? 'сегодня' : `через ${item.daysLeft} дн.`}
							</Badge>
						</div>
					))}
				</div>
			</ContentBlock>
		</Grid.Col>
	);
};
