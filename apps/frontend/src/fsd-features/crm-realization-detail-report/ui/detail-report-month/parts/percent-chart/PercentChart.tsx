import { FC, useMemo } from 'react';
import { IPercentChartProps } from './percent-chart.types';
import { Cell, Pie, PieChart } from 'recharts';
import TailwindColors from '@config/tailwind/color';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { TextField } from '@fsd/shared/ui-kit';
import css from 'fsd-features/crm-realization-detail-report/ui/detail-report-month/detail-report-month.module.scss';

export const PercentChart: FC<IPercentChartProps> = (args) => {
	const { data } = args;

	const chartData = useMemo(() => {
		if (!data?.data) {
			return [{ value: 0 }, { value: 0 }];
		}
		const { realization, plan } = data.data;
		if (!realization || !plan) {
			return [{ value: 0 }, { value: plan }];
		}
		return [{ value: realization }, { value: realization > plan ? 0 : plan - realization }];
	}, [data]);

	const percent = useMemo(() => {
		if (!data) {
			return 0;
		}
		const { realization, plan } = data.data;
		if (!realization || !plan) {
			return 0;
		}
		return Math.round((realization / plan) * 100);
	}, [data]);

	return (
		<div>
			<TextField className={css.percent} mode={'heading'}>
				{percent}%
			</TextField>
			<PieChart width={240} height={240}>
				<Pie data={chartData} startAngle={180} endAngle={0} innerRadius={60} paddingAngle={2} dataKey="value">
					<Cell
						key={`cell-0`}
						fill={
							percent < CRM_REALIZATION_COLORS.RED
								? TailwindColors.error.main
								: percent >= CRM_REALIZATION_COLORS.RED && percent < CRM_REALIZATION_COLORS.YELLOW
								? TailwindColors.warning.main
								: TailwindColors.success.main
						}
					/>
					<Cell key={`cell-1`} fill={TailwindColors.neutral[50]} />
				</Pie>
			</PieChart>
		</div>
	);
};
