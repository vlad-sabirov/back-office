import { FC, memo, useMemo } from 'react';
import { CustomTooltip } from './CustomTemplate';
import { parse } from 'date-fns';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TailwindColors from '@config/tailwind/color';
import { IHistoryChartProps } from '../_chart/chart.types';

export const Month: FC<IHistoryChartProps> = memo((args) => {
	const { height, data, isHideCalc, className } = args;

	const chartData = useMemo(() => {
		return (
			data?.map((report) => {
				const date = parse(`${report.year}-${report.month}`, 'yyyy-MM', new Date());
				return {
					date,
					realization: report.realization,
					plan: report.plan,
					percent: report.percent,
				};
			}) ?? []
		);
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

				<Line type="bump" animationDuration={0} dataKey="realization" stroke={TailwindColors.primary.main} />

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
Month.displayName = 'Month';
