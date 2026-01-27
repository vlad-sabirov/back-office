import { FC, memo } from 'react';
import { IHistoryChartProps } from './chart.types';
import { Month } from '../month/Month';
import { Year } from '../year/Year';

export const Chart: FC<IHistoryChartProps> = memo((props) => {
	const { type = 'month' } = props;

	if (type === 'month') return <Month {...props} />;
	if (type === 'year') return <Year {...props} />;
	return null;
});
Chart.displayName = 'Chart';
