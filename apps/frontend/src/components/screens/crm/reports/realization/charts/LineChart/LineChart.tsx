import { FC, lazy, useEffect, useState } from 'react';
import { IData } from './data.interface';
import { endOfQuarter, format, parse, startOfQuarter } from 'date-fns';
import { ru } from 'date-fns/locale';
import TailwindColors from '@config/tailwind/color';
import { NumberFormat } from '@helpers/NumberFormat';
import { useAccess } from '@hooks';
import { FilterPeriodType, RealizationAccess } from '../..';
import { LineChartProps } from './props';
import css from './styles.module.scss';

const ReactECharts = lazy(() => import('echarts-for-react'));

export const LineChart: FC<LineChartProps> = ({ data, displayCalculate, displayType = FilterPeriodType.Month }) => {
	const CheckAccess = useAccess();
	const [options, setOptions] = useState<unknown>({});
	const [dateList, setDateList] = useState<string[]>([]);
	const [realizationList, setRealizationList] = useState<number[]>([]);
	const [planList, setPlanList] = useState<number[]>([]);
	const isDisplayCalc = displayCalculate || CheckAccess(RealizationAccess.calculate);

	const handleSetData = (dataSet: IData[]) => {
		if (!dataSet || !dataSet.length) return;
		setDateList(() =>
			dataSet.filter((report) => report.realization && report.realization > 0).map((report) => report.date)
		);
		setRealizationList(() =>
			dataSet.filter((report) => report.realization && report.realization > 0).map((report) => report.realization)
		);
		setPlanList(() =>
			dataSet.filter((report) => report.realization && report.realization > 0).map((report) => report.plan)
		);
	};

	useEffect(() => {
		if (data) {
			const result: IData[] = [];
			for (const item of data) {
				const date = `${item.year}-${item.month}`;
				if (!result.some((item) => item.date === date)) {
					result.push({ date: date, realization: item.realization, plan: item.plan });
				} else {
					const findIndex = result.findIndex((item) => item.date === date);
					result[findIndex].plan += item.plan;
					result[findIndex].realization += item.realization;
				}
			}
			handleSetData(result);
		}
	}, [data]);

	useEffect(() => {
		setOptions({
			visualMap: {
				show: false,
				type: 'continuous',
				seriesIndex: 10,
				min: 0,
				max: dateList.length - 1,
			},
			tooltip: {
				trigger: 'axis',
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				formatter: (params: any) => {
					if (!params?.[0]?.name) return '';
					const date = parse(params[0].name, 'yyyy-MM', new Date());
					let result =
						displayType === FilterPeriodType.Year
							? `<p class='${css.date}'><b>${format(date, 'yyyy')}</b></p>`
							: displayType === FilterPeriodType.Quarter
							? `<p class='${css.date}'><b>${format(date, 'yyyy')} ${format(
									startOfQuarter(date),
									'LLLL',
									{
										locale: ru,
									}
								)}-${format(endOfQuarter(date), 'LLLL', {
									locale: ru,
								})}</b></p>`
							: `<p class='${css.date}'><b>${format(date, 'yyyy LLLL', { locale: ru })}</b></p>`;
					const plan = params[0].value;
					const realization = params[1].value;
					const percent = Math.round((realization / plan) * 100);

					if (isDisplayCalc) {
						result += `<p class='${css.plan}'>- План: <span>${NumberFormat(plan)}</span></p>`;
						result += `<p class='${css.realization}'>- Реализация: <span>${NumberFormat(
							realization
						)}</span></p>`;
					}
					result += `<p class='${css.percent}'>- Процент выполнения плана: <span>${percent}%</span></p>`;

					return result;
				},
			},
			xAxis: { data: dateList, show: false },
			yAxis: {
				axisLabel: isDisplayCalc ? {} : { show: false },
			},
			grid: isDisplayCalc
				? {
						top: 20,
						left: 100,
						right: 10,
						height: 230,
				}
				: {
						top: 20,
						left: 30,
						right: 30,
						height: 210,
				},
			series: [
				{
					type: 'line',
					showSymbol: true,
					symbol: 'none',
					color: 'rgba(58,77,233,0.2)',
					lineStyle: { color: 'none', width: 0 },
					areaStyle: { color: TailwindColors.primary.main, opacity: 0.2 },
					data: planList,
					smooth: true,
				},
				{
					type: 'line',
					lineStyle: { color: TailwindColors.primary.main },
					itemStyle: { color: TailwindColors.primary.main },
					data: realizationList,
					smooth: true,
				},
			],
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateList, realizationList, planList]);

	return (
		<>
			<ReactECharts option={options} className={css.chart} />
		</>
	);
};
