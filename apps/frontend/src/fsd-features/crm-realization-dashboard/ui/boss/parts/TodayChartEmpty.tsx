import { useMemo } from 'react';
import { IChartData } from './today-chart-empty.types';
import classNames from 'classnames';
import { format, parse, subMonths } from 'date-fns';
import { Cell, Pie, PieChart } from 'recharts';
import TailwindColors from '@config/tailwind/color';
import { IconBattery } from '@fsd/entities/crm-organization/ui/icon-battery/IconBattery';
import { useCrmWorkingDiff } from '@fsd/entities/crm-working-base';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { HoverCard, Progress } from '@mantine/core';
import { Tooltip } from '@mantine/core';
import css from '../boss.module.scss';

export const TodayChartEmpty = () => {
	const data = useStateSelector((state) => state.crm_working_base.data.allLast);
	const dataAll = useStateSelector((state) => state.crm_working_base.data.all);
	const orgsAll = useStateSelector((state) => state.crm_organization.count.all);
	const datePrev: string = useMemo(() => {
		if (!data || !data.year || !data.month) {
			return '';
		}
		return format(subMonths(parse(`${data.year}-${data.month}`, `yyyy-MM`, new Date()), 1), 'yyyy-M');
	}, [data]);
	const diff = useCrmWorkingDiff(data, dataAll[datePrev] ?? null);

	const chartData = useMemo<IChartData[]>(() => {
		if (!data) return [];

		return [
			{
				name: 'Горячих',
				value: data.active,
				color: TailwindColors.success.main,
			},
			{
				name: 'Теплых',
				value: data.medium,
				color: TailwindColors.warning.main,
			},
			{
				name: 'Холодных',
				value: data.low,
				color: TailwindColors.error[100],
			},
			{
				name: 'Забытых',
				value: data.empty,
				color: TailwindColors.error.main,
			},
		];
	}, [data]);

	const displayProgress = useMemo(() => {
		// const countAll = arrived.length + late.length + didCome.length;
		if (!data) return [];

		return [
			{ value: Math.round((data.active / orgsAll) * 100), color: TailwindColors.success.main },
			{ value: Math.round((data.medium / orgsAll) * 100), color: TailwindColors.warning.main },
			{ value: Math.round((data.low / orgsAll) * 100), color: TailwindColors.error[100] },
			{ value: Math.round((data.empty / orgsAll) * 100), color: TailwindColors.error.main },
			{ value: 100, color: TailwindColors.neutral[50] },
		];
	}, [data, orgsAll]);

	return (
		<div className={css.todayChartEmptyWrapper}>
			<div className={css.chart}>
				<PieChart width={100} height={100}>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						outerRadius={50}
						innerRadius={25}
						fill="#8884d8"
					>
						{chartData.map((entry, index) => {
							return <Cell key={`cell-${index}`} fill={entry.color} />;
						})}
					</Pie>
				</PieChart>
			</div>

			<TextField size={'small'} mode={'heading'} className={css.title}>
				Работа базы
			</TextField>

			<HoverCard radius={'md'} shadow={'xl'} withArrow>
				<HoverCard.Target>
					<Progress size={'md'} radius={'xl'} sections={displayProgress} className={css.progress} />
				</HoverCard.Target>
				<HoverCard.Dropdown>
					<TextField size={'small'} className={css.progress__text}>
						Всего организаций: <span>{NumberFormat(orgsAll)}</span>
					</TextField>

					<TextField size={'small'} className={css.progress__text}>
						Распределено по сотрудникам:{' '}
						<span>
							{NumberFormat(data?.total || 0)}
							<sup> {NumberFormat(Math.round(((data?.total || 0) / orgsAll) * 100), { after: '%' })}</sup>
						</span>
					</TextField>
				</HoverCard.Dropdown>
			</HoverCard>

			<TextField className={css.workingBaseAll}>
				Распределенная база:{' '}
				<span>
					{data?.total}
					{diff &&
						diff.totalPercent !== 0 &&
						NumberFormat(diff.totalPercent, { sup: true, operator: true, after: '%' })}
				</span>
			</TextField>

			<Tooltip
				label={`${Math.round(((data?.active ?? 0) / (data?.total ?? 0)) * 10000) / 100}%`}
				position={'left'}
				radius={'md'}
				withArrow
			>
				<TextField className={css.workingBase}>
					<IconBattery updatedAt={null} hardType={'full'} />
					Горячих:{' '}
					<span>
						{data?.active}
						{diff &&
							diff.activePercent !== 0 &&
							NumberFormat(diff.activePercent, { sup: true, operator: true, after: '%' })}
					</span>
				</TextField>
			</Tooltip>

			<Tooltip
				label={`${Math.round(((data?.medium ?? 0) / (data?.total ?? 0)) * 10000) / 100}%`}
				position={'left'}
				radius={'md'}
				withArrow
			>
				<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
					<IconBattery updatedAt={null} hardType={'medium'} />
					Теплых:{' '}
					<span>
						{data?.medium}
						{diff &&
							diff.mediumPercent !== 0 &&
							NumberFormat(diff.mediumPercent, { sup: true, operator: true, after: '%' })}
					</span>
				</TextField>
			</Tooltip>

			<Tooltip
				label={`${Math.round(((data?.low ?? 0) / (data?.total ?? 0)) * 10000) / 100}%`}
				position={'left'}
				radius={'md'}
				withArrow
			>
				<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
					<IconBattery updatedAt={null} hardType={'low'} />
					Холодных:{' '}
					<span>
						{data?.low}
						{diff &&
							diff.lowPercent !== 0 &&
							NumberFormat(diff.lowPercent, { sup: true, operator: true, after: '%' })}
					</span>
				</TextField>
			</Tooltip>

			<Tooltip
				label={`${Math.round(((data?.empty ?? 0) / (data?.total ?? 0)) * 10000) / 100}%`}
				position={'left'}
				radius={'md'}
				withArrow
			>
				<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
					<IconBattery updatedAt={null} hardType={'empty'} />
					Забытых:{' '}
					<span>
						{data?.empty}
						{diff &&
							diff.emptyPercent !== 0 &&
							NumberFormat(diff.emptyPercent, { sup: true, operator: true, after: '%' })}
					</span>
				</TextField>
			</Tooltip>
		</div>
	);
};
