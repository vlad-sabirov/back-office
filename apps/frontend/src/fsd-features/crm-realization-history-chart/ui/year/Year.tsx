import { FC, memo, useMemo } from 'react';
import { CustomTooltip } from './CustomTemplate';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TailwindColors from '@config/tailwind/color';
import { IHistoryChartProps, chartData } from '../_chart/chart.types';

export const Year: FC<IHistoryChartProps> = memo((args) => {
	const { height, data, isHideCalc, className } = args;

	const chartData = useMemo<chartData[]>(() => {
		if (!data) return [];
		const output: Map<number, chartData> = new Map();
		for (const item of data) {
			if (!output.has(item.year)) {
				output.set(item.year, {
					date: new Date(`${item.year}-1-1`),
					plan: item.plan,
					realization: item.realization,
					percent: item.percent,
				});
			} else {
				const found = output.get(item.year);
				const plan = found?.plan && item.plan ? item.plan + found?.plan : item.plan ?? 0;
				const realization =
					found?.realization && item.realization
						? item.realization + found?.realization
						: item.realization ?? 0;
				const percent = Math.round((realization / plan) * 100);
				output.set(item.year, {
					date: new Date(`${item.year}-1-1`),
					plan: plan,
					realization: realization,
					percent: percent,
				});
			}
		}
		return Array.from(output.values());
	}, [data]);

	return (
		<ResponsiveContainer width={'100%'} height={height} className={className}>
			<ComposedChart
				data={chartData}
				margin={
					isHideCalc ? { left: 0, top: 0, right: 0, bottom: 0 } : { left: 32, top: 4, right: 0, bottom: 0 }
				}
			>
				<Area
					type="monotone"
					animationDuration={0}
					dataKey="plan"
					fill={TailwindColors.primary[50]}
					stroke={'none'}
				/>

				<Bar
					type="monotone"
					animationDuration={0}
					dataKey="realization"
					fill={TailwindColors.primary[100]}
					stroke={TailwindColors.primary[200]}
				/>

				<CartesianGrid strokeDasharray="3 5" />

				<YAxis
					type={'number'}
					tickFormatter={(val) => Intl.NumberFormat('ru-RU').format(Number(val))}
					tick={{
						fontFamily: '"Fira Sans", sans-serif',
						fontSize: 12,
					}}
					hide={isHideCalc}
				/>
				<XAxis hide dataKey={'date'} />

				{!isHideCalc && <Tooltip labelFormatter={() => 'asd'} content={<CustomTooltip />} />}
			</ComposedChart>
		</ResponsiveContainer>
	);
});
Year.displayName = 'Year';
