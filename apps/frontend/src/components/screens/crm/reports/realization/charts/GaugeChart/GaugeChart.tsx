import { FC, lazy, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import { useAccess } from '@hooks';
import { PercentColors, RealizationAccess } from '../..';
import { GaugeChartColorProps, GaugeChartProps } from './props';
import css from './styles.module.scss';

const ReactECharts = lazy(() => import('echarts-for-react'));

const COLORS: { red: GaugeChartColorProps; yellow: GaugeChartColorProps; green: GaugeChartColorProps } = {
	red: { main: '#f9515a', darken: '#f82b36' },
	yellow: { main: '#ffc859', darken: '#ffb829' },
	green: { main: '#99d962', darken: '#75c530' },
};

export const GaugeChart: FC<GaugeChartProps> = observer(({ data, displayCalculate }) => {
	const CheckAccess = useAccess();
	const [plan, setPlan] = useState<number | null>(null);
	const [realization, setRealization] = useState<number | null>(null);
	const [percent, setPercent] = useState<number | null>(0);
	const [color, setColor] = useState<GaugeChartColorProps>(COLORS.red);

	useEffect(() => {
		if (data) {
			let calcPlan = 0;
			let calcRealization = 0;
			data.map((report) => {
				calcPlan += report.plan ? report.plan : 0;
				calcRealization += report.realization ? report.realization : 0;
			});
			const calcPercent = data.length ? Math.round((calcRealization / calcPlan) * 100) : 0;

			setPlan(calcPlan);
			setRealization(calcRealization);
			setPercent(calcPercent);
			setColor(
				calcPercent < PercentColors.red
					? COLORS.red
					: calcPercent < PercentColors.yellow
					? COLORS.yellow
					: COLORS.green
			);
		}
	}, [data]);

	const getOption = useMemo(
		() => ({
			series: [
				{
					type: 'gauge',
					center: ['50%', '70%'],
					radius: '100%',
					startAngle: 200,
					endAngle: -20,
					min: 0,
					max: 100,
					splitNumber: 10,
					itemStyle: { color: color.main },
					progress: { show: true, width: 30 },
					axisLine: { lineStyle: { width: 10 } },
					axisTick: {
						distance: -25,
						splitNumber: 5,
						lineStyle: { width: 1, color: '#999' },
					},
					splitLine: {
						distance: -30,
						length: 10,
						lineStyle: { width: 2, color: '#999' },
					},
					axisLabel: { distance: -20, color: '#999', fontSize: 12 },
					pointer: { show: false },
					anchor: { show: false },
					title: { show: false },
					detail: {
						valueAnimation: true,
						width: '60%',
						lineHeight: 40,
						borderRadius: 8,
						offsetCenter: [0, '-15%'],
						fontSize: 60,
						fontWeight: 'bolder',
						formatter: '{value}%',
						color: 'inherit',
					},
					data: [{ value: percent }],
				},

				{
					type: 'gauge',
					center: ['50%', '70%'],
					radius: '100%',
					startAngle: 200,
					endAngle: -20,
					min: 0,
					max: 100,
					itemStyle: { color: color.darken },
					progress: { show: true, width: 8 },
					pointer: { show: false },
					axisLine: { show: false },
					axisTick: { show: false },
					splitLine: { show: false },
					axisLabel: { show: false },
					detail: { show: false },
					data: [{ value: percent }],
				},
			],
		}),
		[color, percent]
	);

	return (
		<>
			<ReactECharts option={getOption} style={{ height: 260 }} />

			{(CheckAccess(RealizationAccess.calculate) || displayCalculate) && (
				<div className={css.info}>
					<TextField size="small">План: {NumberFormat(plan)}</TextField>
					<TextField size="small">Реализация: {NumberFormat(realization)}</TextField>
				</div>
			)}
		</>
	);
});
